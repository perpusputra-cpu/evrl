import type { Request, Response } from 'express';
import app from '../server';

/**
 * Vercel Serverless Function entry point.
 * Ensures compatibility between Vercel serverless routing and Express route definitions.
 */
export default function handler(req: Request, res: Response) {
  // Normalize incoming url path if Vercel strip-rewrote the /api prefix
  if (req.url && !req.url.startsWith('/api')) {
    req.url = `/api${req.url}`;
  }
  return app(req, res);
}
