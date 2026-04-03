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

    const locale = data.locale || 'en'
    const cmsUrl = env.CMS_PUBLIC_SERVER_URL

    if (!cmsUrl) {
      return new Response(JSON.stringify({ error: 'CMS_PUBLIC_SERVER_URL not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      })
    }

    const res = await fetch(`${cmsUrl}/api/subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, locale }),
    })

    const result = await res.json()

    return new Response(JSON.stringify(result), {
      status: res.status,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    })
  } catch (error) {
    console.error('Subscribe proxy error:', error)
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
