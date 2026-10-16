export interface ApiEnv { VOICEGATEWAY_API?: Fetcher }

// Keep the existing Worker as the D1/API owner. Service bindings call it
// privately, preserving its stats credential, records and email configuration.
export const onRequest: PagesFunction<ApiEnv> = async ({ request, env }) => {
  const path = new URL(request.url).pathname.replace(/\/$/, '');
  const method = path === '/api/waitlist' ? 'POST' : path === '/api/stats' ? 'GET' : null;
  const json = (error: string, status: number) => Response.json({ ok: false, error }, { status, headers: { 'Cache-Control': 'no-store' } });
  if (!method) return json('not found', 404);
  if (request.method !== method) return new Response(null, { status: 405, headers: { Allow: method, 'Cache-Control': 'no-store' } });
  if (method === 'POST') {
    const origin = request.headers.get('origin');
    if (origin && origin !== new URL(request.url).origin) return json('forbidden origin', 403);
  }
  if (!env.VOICEGATEWAY_API) return json('API not configured', 503);
  try {
    const response = await env.VOICEGATEWAY_API.fetch(request);
    const headers = new Headers(response.headers);
    headers.set('Cache-Control', 'no-store');
    return new Response(response.body, { status: response.status, headers });
  } catch {
    return json('API unavailable', 503);
  }
};
