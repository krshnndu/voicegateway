import { afterEach, describe, expect, it, vi } from 'vitest';
afterEach(() => {vi.unstubAllGlobals();vi.resetModules();vi.clearAllMocks()});
describe('production analytics', () => {
  it('does not initialize tracking on localhost or Pages previews',async () => {
    const capture=vi.fn(); const init=vi.fn();
    vi.doMock('posthog-js',()=>({default:{init,capture,register:vi.fn()}}));
    const {track}=await import('../src/lib/analytics');
    for (const hostname of ['localhost','127.0.0.1','voicegateway-web.pages.dev']) {
      vi.stubGlobal('window',{location:{hostname,origin:`https://${hostname}`}});
      await track('waitlist_joined');
    }
    expect(init).not.toHaveBeenCalled();expect(capture).not.toHaveBeenCalled();
  });
  it('tags events, uses memory persistence and counts an initial route once',async () => {
    const capture=vi.fn();const init=vi.fn();
    vi.doMock('posthog-js',()=>({default:{init,capture,register:vi.fn()}}));
    vi.stubGlobal('window',{location:{hostname:'voicegateway.dev',origin:'https://voicegateway.dev'}});
    const {track,trackPageview}=await import('../src/lib/analytics');
    await Promise.all([trackPageview('/'),trackPageview('/')]);await trackPageview('/about');await trackPageview('/');
    await track('waitlist_joined',{source:'landing'});
    expect(init).toHaveBeenCalledTimes(1);
    expect(init.mock.calls[0][1]).toMatchObject({capture_pageview:false,persistence:'memory',disable_session_recording:true,autocapture:false});
    expect(capture.mock.calls.filter(call=>call[0]==='$pageview')).toHaveLength(3);
    expect(capture).toHaveBeenLastCalledWith('waitlist_joined',{source:'landing',site:'voicegateway'});
  });
});
