import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { Shield, ShieldAlert, ShieldCheck, RefreshCw } from 'lucide-react';

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: string | HTMLElement,
        params: {
          sitekey: string;
          action?: string;
          cData?: string;
          callback?: (token: string) => void;
          'error-callback'?: (errorCode: string) => void;
          'expired-callback'?: () => void;
          theme?: 'light' | 'dark' | 'auto';
          size?: 'normal' | 'compact' | 'flexible';
          appearance?: 'always' | 'execute' | 'interaction-only';
          retry?: 'auto' | 'never';
        }
      ) => string;
      reset: (widgetId?: string) => void;
      remove: (widgetId?: string) => void;
      getResponse: (widgetId?: string) => string | undefined;
    };
    onloadTurnstileCallback?: () => void;
  }
}

export interface TurnstileWidgetRef {
  reset: () => void;
  getResponse: () => string | undefined;
}

export interface TurnstileWidgetProps {
  siteKey?: string;
  action?: string;
  onSuccess: (token: string) => void;
  onError?: (errorCode?: string) => void;
  onExpire?: () => void;
  theme?: 'light' | 'dark' | 'auto';
  size?: 'normal' | 'compact' | 'flexible';
  className?: string;
}

const SCRIPT_ID = 'cf-turnstile-script';
const SCRIPT_URL = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
export const DEFAULT_SITE_KEY = '0x4AAAAAAEmAgjECAyxbcVQX';

export const TurnstileWidget = forwardRef<TurnstileWidgetRef, TurnstileWidgetProps>(
  (
    {
      siteKey: propSiteKey,
      action = 'generic-action',
      onSuccess,
      onError,
      onExpire,
      theme = 'dark',
      size = 'normal',
      className = '',
    },
    ref
  ) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const widgetIdRef = useRef<string | null>(null);
    const [status, setStatus] = useState<'loading' | 'ready' | 'verified' | 'expired' | 'error' | 'no-key'>('loading');
    const [lastToken, setLastToken] = useState<string | null>(null);

    // Turnstile site key prioritizing prop or env, defaulting to project site key
    const siteKey =
      propSiteKey ||
      (import.meta as any).env?.VITE_TURNSTILE_SITE_KEY ||
      DEFAULT_SITE_KEY;

    // Expose reset and getResponse to parent
    useImperativeHandle(
      ref,
      () => ({
        reset: () => {
          if (widgetIdRef.current && window.turnstile) {
            try {
              window.turnstile.reset(widgetIdRef.current);
              setStatus('ready');
              setLastToken(null);
            } catch (err) {
              console.warn('[Turnstile] Error resetting widget:', err);
            }
          } else if (!siteKey) {
            // Dev mode reset
            setStatus('ready');
            setLastToken(null);
          }
        },
        getResponse: () => {
          if (widgetIdRef.current && window.turnstile) {
            return window.turnstile.getResponse(widgetIdRef.current);
          }
          return lastToken || undefined;
        },
      }),
      [siteKey, lastToken]
    );

    // Initialize Turnstile script and widget
    useEffect(() => {
      let isMounted = true;

      // If no site key is supplied (e.g. initial dev environment), inform user gracefully
      if (!siteKey) {
        setStatus('no-key');
        // Provide a dev bypass token so local workflow without Cloudflare account still functions
        const devBypassToken = 'dev_bypass_turnstile_token';
        setLastToken(devBypassToken);
        onSuccess(devBypassToken);
        return;
      }

      const renderWidget = () => {
        if (!containerRef.current || !window.turnstile || !isMounted) return;

        // Clean up previous instance if exists
        if (widgetIdRef.current) {
          try {
            window.turnstile.remove(widgetIdRef.current);
          } catch (e) {
            // ignore cleanup error
          }
          widgetIdRef.current = null;
        }

        try {
          const id = window.turnstile.render(containerRef.current, {
            sitekey: siteKey,
            action,
            theme,
            size,
            appearance: 'always', // Managed mode: always show container with managed challenge behavior
            callback: (token: string) => {
              if (!isMounted) return;
              setStatus('verified');
              setLastToken(token);
              onSuccess(token);
            },
            'error-callback': (code: string) => {
              if (!isMounted) return;
              console.warn('[Turnstile] Challenge error callback code:', code);
              setStatus('error');
              onError?.(code);
            },
            'expired-callback': () => {
              if (!isMounted) return;
              setStatus('expired');
              setLastToken(null);
              onExpire?.();
            },
          });

          widgetIdRef.current = id;
          setStatus('ready');
        } catch (error) {
          console.error('[Turnstile] Failed to render widget:', error);
          if (isMounted) setStatus('error');
        }
      };

      // Load Cloudflare script if not yet loaded
      if (window.turnstile) {
        renderWidget();
      } else {
        let script = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
        if (!script) {
          script = document.createElement('script');
          script.id = SCRIPT_ID;
          script.src = SCRIPT_URL;
          script.async = true;
          script.defer = true;
          document.head.appendChild(script);
        }

        const handleScriptLoad = () => {
          if (isMounted) renderWidget();
        };

        script.addEventListener('load', handleScriptLoad);
        return () => {
          isMounted = false;
          script?.removeEventListener('load', handleScriptLoad);
          if (widgetIdRef.current && window.turnstile) {
            try {
              window.turnstile.remove(widgetIdRef.current);
            } catch (e) {
              // ignore
            }
          }
        };
      }

      return () => {
        isMounted = false;
        if (widgetIdRef.current && window.turnstile) {
          try {
            window.turnstile.remove(widgetIdRef.current);
          } catch (e) {
            // ignore
          }
        }
      };
    }, [siteKey, action, theme, size, onSuccess, onError, onExpire]);

    // Render developer notice if site key is absent
    if (status === 'no-key') {
      return (
        <div
          className={`flex items-center justify-between px-3 py-1.5 rounded-lg bg-emerald-950/40 border border-emerald-800/40 text-[11px] text-stone-300 font-mono ${className}`}
        >
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>
              Cloudflare Turnstile:{' '}
              <span className="text-emerald-300 font-semibold">Dev Bypass Aktif</span>
            </span>
          </div>
          <span className="text-[10px] text-stone-500">
            Set VITE_TURNSTILE_SITE_KEY untuk live mode
          </span>
        </div>
      );
    }

    return (
      <div className={`turnstile-wrapper flex flex-col space-y-1.5 ${className}`}>
        {/* Canonical hidden input for cf-turnstile-response */}
        <input type="hidden" name="cf-turnstile-response" value={lastToken || ''} />

        {/* The Cloudflare Turnstile Managed Widget Container */}
        <div ref={containerRef} className="min-h-[65px] flex items-center" />

        {/* Minimal Status Feedback */}
        {status === 'expired' && (
          <div className="flex items-center space-x-1.5 text-[11px] text-amber-400 font-mono">
            <RefreshCw className="w-3 h-3 animate-spin" />
            <span>Token keamanan kedaluwarsa. Memperbarui tantangan Turnstile...</span>
          </div>
        )}

        {status === 'error' && (
          <div className="flex items-center space-x-1.5 text-[11px] text-red-400 font-mono">
            <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
            <span>Gagal memuat tantangan Cloudflare Turnstile. Silakan muat ulang halaman.</span>
          </div>
        )}

        {status === 'verified' && (
          <div className="flex items-center space-x-1 text-[10px] text-emerald-400/90 font-mono">
            <ShieldCheck className="w-3 h-3 shrink-0" />
            <span>Verifikasi Keamanan Terkonfirmasi (Managed Mode)</span>
          </div>
        )}
      </div>
    );
  }
);

TurnstileWidget.displayName = 'TurnstileWidget';
