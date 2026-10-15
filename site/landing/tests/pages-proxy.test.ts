import { describe, it, expect, vi } from 'vitest';
import { onRequest } from '../functions/api/[[path]]';
const invoke = (request: Request, fetch?: ReturnType<typeof vi.fn>) => onRequest({ request, env: fetch ? { VOICEGATEWAY_API: { fetch } } : {} } as unknown as Parameters<typeof onRequest>[0]);
describe('private Pages API binding', () => {
  it('preserves stats auth and does not cache private records', async () => {
    const fetch = vi.fn(async () => Response.json({ok:true,total:2}));
    const request = new Request('https://voicegateway.dev/api/stats?format=json', {headers:{authorization:'Bearer test-key'}});
    const response = await invoke(request,fetch);
    expect(fetch).toHaveBeenCalledWith(request);
    expect(request.headers.get('authorization')).toBe('Bearer test-key');
    expect(response.headers.get('cache-control')).toBe('no-store');
    expect(await response.json()).toEqual({ok:true,total:2});
  });
  it('preserves a backend authentication refusal',async () => {
    const response = await invoke(new Request('https://voicegateway.dev/api/stats'),vi.fn(async () => Response.json({ok:false},{status:401})));
    expect(response.status).toBe(401);
  });
  it('forwards the waitlist body unchanged and preserves storage failure',async () => {
    const fetch = vi.fn(async (request:Request) => { expect(await request.json()).toEqual({email:'test@example.com',source:'landing'});return Response.json({ok:false},{status:500}); });
    const response = await invoke(new Request('https://voicegateway.dev/api/waitlist',{method:'POST',body:JSON.stringify({email:'test@example.com',source:'landing'}),headers:{origin:'https://voicegateway.dev'}}),fetch);
    expect(response.status).toBe(500);
  });
  it('does not expose arbitrary Worker routes or accept a cross-origin signup',async () => {
    const fetch = vi.fn();
    expect((await invoke(new Request('https://voicegateway.dev/api/other'),fetch)).status).toBe(404);
    expect((await invoke(new Request('https://voicegateway.dev/api/waitlist'),fetch)).status).toBe(405);
    expect((await invoke(new Request('https://voicegateway.dev/api/waitlist',{method:'POST',headers:{origin:'https://other.example'}}),fetch)).status).toBe(403);
    expect(fetch).not.toHaveBeenCalled();
  });
  it('reports missing/unavailable API bindings without false success',async () => {
    expect((await invoke(new Request('https://voicegateway.dev/api/stats'))).status).toBe(503);
    expect((await invoke(new Request('https://voicegateway.dev/api/stats'),vi.fn(async () => {throw new Error('unavailable')}))).status).toBe(503);
  });
});
