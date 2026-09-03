import { Request, Response, NextFunction } from 'express';

export interface TurnstileVerificationResult {
  success: boolean;
  challenge_ts?: string;
  hostname?: string;
  'error-codes'?: string[];
  action?: string;
  cdata?: string;
  bypassed?: boolean;
}

/**
 * Validates a Cloudflare Turnstile response token with Cloudflare's siteverify API.
 * Endpoint: https://challenges.cloudflare.com/turnstile/v0/siteverify
 */
export async function validateTurnstileToken(
  token: string,
  remoteIp?: string
): Promise<TurnstileVerificationResult> {
  const secretKey = process.env.TURNSTILE_SECRET;

  if (!secretKey) {
    console.warn(
      '[Turnstile] TURNSTILE_SECRET is not configured in server environment. Permitting request in development mode.'
    );
    return { success: true, bypassed: true };
  }

  if (!token || typeof token !== 'string' || token.trim() === '') {
    return {
      success: false,
      'error-codes': ['missing-input-response'],
    };
  }

  try {
    const formData = new URLSearchParams();
    formData.append('secret', secretKey);
    formData.append('response', token.trim());
    if (remoteIp) {
      formData.append('remoteip', remoteIp);
    }

    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    if (!response.ok) {
      console.error(
        `[Turnstile] Cloudflare siteverify HTTP error: ${response.status} ${response.statusText}`
      );
      return {
        success: false,
        'error-codes': [`http-error-${response.status}`],
      };
    }

    const data = (await response.json()) as TurnstileVerificationResult;
    return data;
  } catch (error) {
    console.error('[Turnstile] Error during Cloudflare Turnstile siteverify request:', error);
    return {
      success: false,
      'error-codes': ['internal-verification-error'],
    };
  }
}

/**
 * Express middleware to enforce Cloudflare Turnstile verification on protected expensive endpoints.
 * Rejects requests with HTTP 403 if Turnstile validation fails.
 */
export function requireTurnstile(actionName?: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const secretKey = process.env.TURNSTILE_SECRET;

    // If server has no TURNSTILE_SECRET configured (e.g. dev environment before keys are provided),
    // allow requests with a notice so developer flow isn't completely blocked.
    if (!secretKey) {
      return next();
    }

    // Extract token from request headers or body
    const token =
      (req.headers['x-turnstile-token'] as string) ||
      req.body?.turnstileToken ||
      req.body?.turnstile_token ||
      req.body?.token;

    if (!token) {
      return res.status(403).json({
        success: false,
        error: 'Verifikasi keamanan Cloudflare Turnstile diperlukan. Token tidak ditemukan.',
        code: 'TURNSTILE_REQUIRED',
        action: actionName,
      });
    }

    // Extract remote IP for verification
    const forwarded = req.headers['x-forwarded-for'];
    const remoteIp =
      typeof forwarded === 'string'
        ? forwarded.split(',')[0].trim()
        : req.socket.remoteAddress;

    const outcome = await validateTurnstileToken(token, remoteIp);

    if (!outcome.success) {
      console.warn(
        `[Turnstile] Verification failed for action "${actionName || 'unknown'}":`,
        outcome['error-codes']
      );
      return res.status(403).json({
        success: false,
        error:
          'Verifikasi Cloudflare Turnstile gagal atau token telah kedaluwarsa. Silakan lengkapi tantangan keamanan.',
        code: 'TURNSTILE_FORBIDDEN',
        details: outcome['error-codes'],
        action: actionName,
      });
    }

    // Attach verified outcome to request
    (req as any).turnstile = outcome;
    next();
  };
}
