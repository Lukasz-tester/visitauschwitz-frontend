export async function onRequestPost(context) {
  const { request, env } = context

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }

  try {
    const data = await request.json()

    // Honeypot: silently succeed if bot field is filled
    if (data._hp_company) {
      return new Response(JSON.stringify({ success: true }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      })
    }

    const email = (data.email || '').trim()
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return new Response(JSON.stringify({ error: 'Invalid email address' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      })
    }

    const message = (data.message || '').trim()
    const name = data.name || ''
    const locale = data.locale || 'en'
    const isContact = message.length > 0

    const fromEmail = env.EMAIL_FROM || 'contact@visitauschwitz.info'
    const toEmail = env.EMAIL_TO || 'lukaszcelta@gmail.com'

    const promises = []

    // 1. Add contact to Resend segment (for both types)
    promises.push(
      fetch('https://api.resend.com/contacts', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          unsubscribed: false,
          segments: [{ id: env.RESEND_SEGMENT_ID }],
        }),
      }),
    )

    if (isContact) {
      // --- Contact form flow ---

      // 2. Notification to owner
      promises.push(
        fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${env.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: fromEmail,
            to: toEmail,
            subject: `Contact: ${email}`,
            html: `
              <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 520px; margin: 0 auto; color: #1a1a1a;">
                <h2 style="margin: 0 0 16px;">New Contact Form Message</h2>
                <p><strong>From:</strong> ${name || 'Website visitor'}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Locale:</strong> ${locale}</p>
                <hr style="margin: 16px 0; border: none; border-top: 1px solid #e5e5e5;">
                <p><strong>Message:</strong></p>
                <p style="white-space: pre-wrap;">${message.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>
              </div>
            `,
            reply_to: email,
          }),
        }),
      )

      // 3. Auto-reply to user
      promises.push(
        fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${env.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: fromEmail,
            to: email,
            subject: 'Thanks for reaching out!',
            html: `
              <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 520px; margin: 0 auto; color: #1a1a1a; line-height: 1.6;">
                <p>Hi there,</p>
                <p>Thank you for your message! I've received it and I'll get back to you as soon as I can.</p>
                <p>Here's what you wrote:</p>
                <blockquote style="margin: 16px 0; padding: 12px 16px; background: #f5f5f5; border-left: 3px solid #d4a574; border-radius: 4px; color: #555;">
                  ${message.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>')}
                </blockquote>
                <p>Talk soon,</p>
                <p style="margin: 0;"><strong>Łukasz, the guide</strong></p>
                <p style="margin: 4px 0 0; color: #888; font-size: 13px;">visitauschwitz.info</p>
              </div>
            `,
          }),
        }),
      )
    } else {
      // --- Checklist/newsletter subscription flow ---

      // 2. Notification to owner
      promises.push(
        fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${env.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: fromEmail,
            to: toEmail,
            subject: `New Checklist Subscriber: ${email}`,
            html: `
              <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 520px; margin: 0 auto; color: #1a1a1a;">
                <h2 style="margin: 0 0 16px;">New Checklist Subscriber</h2>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Locale:</strong> ${locale}</p>
              </div>
            `,
          }),
        }),
      )

      // 3. Auto-reply to user
      promises.push(
        fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${env.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: fromEmail,
            to: email,
            subject: 'Thanks for signing up!',
            html: `
              <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 520px; margin: 0 auto; color: #1a1a1a; line-height: 1.6;">
                <p>Hi there,</p>
                <p>Thank you for signing up for the Auschwitz visit checklist! I'm glad you're preparing — it makes a real difference.</p>
                <p>I'll be in touch with useful tips and information to help you get the most out of your visit.</p>
                <p>All the best,</p>
                <p style="margin: 0;"><strong>Łukasz, the guide</strong></p>
                <p style="margin: 4px 0 0; color: #888; font-size: 13px;">visitauschwitz.info</p>
              </div>
            `,
          }),
        }),
      )
    }

    const results = await Promise.all(promises)

    // Check if email sends succeeded (skip index 0 which is the contact add)
    for (let i = 1; i < results.length; i++) {
      if (!results[i].ok) {
        const error = await results[i].text()
        console.error(`Resend API error (step ${i}):`, error)
        throw new Error('Failed to send email')
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    })
  } catch (error) {
    console.error('Contact/subscribe error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    })
  }
}

// Handle CORS preflight
export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
