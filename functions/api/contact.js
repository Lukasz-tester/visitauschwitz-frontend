export async function onRequestPost(context) {
  const { request, env } = context

  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }

  try {
    const data = await request.json()

    // Log received fields for debugging
    console.log('Received form data:', JSON.stringify(data, null, 2))

    // Helper to find field by multiple possible names (case-insensitive)
    const findField = (possibleNames) => {
      if (data.submissionData) {
        for (const name of possibleNames) {
          const field = data.submissionData.find(
            (f) => f.field.toLowerCase() === name.toLowerCase()
          )
          if (field?.value) return field.value
        }
      }
      // Also check flat data structure
      for (const name of possibleNames) {
        if (data[name]) return data[name]
      }
      return null
    }

    // Extract form fields - handle various field naming conventions
    const name = findField(['name', 'full-name', 'fullName', 'full_name', 'your-name', 'yourName']) || 'Unknown'
    const email = findField(['email', 'e-mail', 'emailAddress', 'email-address']) || 'No email'
    const message = findField(['message', 'content', 'body', 'inquiry', 'comments', 'comment']) || 'No message'

    const fromEmail = env.EMAIL_FROM || 'contact@visitauschwitz.info'
    const toEmail = env.EMAIL_TO || 'lukaszcelta@gmail.com'

    // Send both emails in parallel
    const [notificationResponse, confirmationResponse] = await Promise.all([
      // 1. Notification email to site owner
      fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: fromEmail,
          to: toEmail,
          subject: `Contact Form: ${name}`,
          html: `
            <h2>New Contact Form Submission</h2>
            <p><strong>From:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Message:</strong></p>
            <p>${message.replace(/\n/g, '<br>')}</p>
          `,
          reply_to: email,
        }),
      }),
      // 2. Confirmation email to user
      fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: fromEmail,
          to: email,
          subject: 'Thank you for contacting Visit Auschwitz',
          html: `
            <h2>Thank you for your message, ${name}!</h2>
            <p>We have received your inquiry and will get back to you as soon as possible.</p>
            <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
            <p><strong>Your message:</strong></p>
            <p style="color: #666;">${message.replace(/\n/g, '<br>')}</p>
            <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
            <p style="color: #888; font-size: 12px;">This is an automated confirmation. Please do not reply to this email.</p>
          `,
        }),
      }),
    ])

    if (!notificationResponse.ok || !confirmationResponse.ok) {
      const error = await notificationResponse.text()
      console.error('Resend API error:', error)
      throw new Error('Failed to send email')
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    })
  } catch (error) {
    console.error('Contact form error:', error)
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
