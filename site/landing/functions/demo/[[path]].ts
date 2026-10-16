export const onRequest: PagesFunction = async ({ request, env, next }) => {
  if (!['GET', 'HEAD'].includes(request.method)) return new Response(null, { status: 405, headers: { Allow: 'GET, HEAD' } });
  const response = await next();
  if (response.status !== 404) return response;
  return env.ASSETS.fetch(new Request(new URL('/demo/index.html', request.url), request));
};
