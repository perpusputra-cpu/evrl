import type { Request, Response } from 'express';
import app from '../server';

/**
 * Vercel Serverless Function entry point.
 * Ensures compatibility between Vercel serverless routing and Express route definitions.
 */
export default function handler(req: Request, res: Response) {
  // Normalize incoming URL path: Vercel rewrites may pass destination or stripped path.
  // Check headers provided by Vercel's edge router to get the true requested API route.
  const matchedPath =
    (req.headers['x-matched-path'] as string) ||
    (req.headers['x-vercel-matched-path'] as string) ||
    (req.headers['x-forwarded-url'] as string) ||
    (req.headers['x-forwarded-uri'] as string);

  if (matchedPath && matchedPath.startsWith('/api')) {
    // Preserve query parameters if present on req.url
    const queryIdx = req.url ? req.url.indexOf('?') : -1;
    const query = queryIdx !== -1 ? req.url.slice(queryIdx) : '';
    req.url = matchedPath.includes('?') ? matchedPath : `${matchedPath}${query}`;
  } else if (req.url && !req.url.startsWith('/api')) {
    req.url = `/api${req.url}`;
  }

  return app(req, res);
}
