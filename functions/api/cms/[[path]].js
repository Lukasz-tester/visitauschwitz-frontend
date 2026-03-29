export async function onRequestGet(context) {
  const { request, env, params } = context
  const cmsUrl = env.CMS_PUBLIC_SERVER_URL

  if (!cmsUrl) {
    return new Response(JSON.stringify({ error: 'CMS_PUBLIC_SERVER_URL not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const url = new URL(request.url)
  const path = Array.isArray(params.path) ? params.path.join('/') : params.path || ''
  const target = `${cmsUrl}/api/${path}${url.search}`

  const res = await fetch(target, {
    headers: {
      Accept: 'application/json',
    },
  })

  return new Response(res.body, {
    status: res.status,
    headers: {
      'Content-Type': res.headers.get('Content-Type') || 'application/json',
    },
  })
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
