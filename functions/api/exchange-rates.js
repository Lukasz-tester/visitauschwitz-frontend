export async function onRequest() {
  try {
    const res = await fetch('https://api.frankfurter.app/latest?base=PLN&symbols=EUR,USD,GBP')
    if (!res.ok) return new Response('upstream error', { status: 502 })
    const json = await res.json()
    return new Response(JSON.stringify({ rates: json.rates, updatedAt: json.date }), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600',
      },
    })
  } catch {
    return new Response('fetch failed', { status: 500 })
  }
}
