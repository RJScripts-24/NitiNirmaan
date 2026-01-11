import { Request, Response, NextFunction } from 'express';
import { getUserFromToken } from '../lib/supabase.js';

// Extend Express Request type to include user
declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                email?: string;
                [key: string]: any;
            };
            supabaseClient?: ReturnType<typeof import('../lib/supabase.js').createAuthenticatedClient>;
        }
    }
}

/**
 * Authentication middleware that extracts and verifies JWT from Authorization header.
 * Attaches user and authenticated Supabase client to request object.
 */
export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Missing or invalid Authorization header' });
        }

        const token = authHeader.substring(7); // Remove 'Bearer ' prefix

        const result = await getUserFromToken(token);

        if (!result) {
            return res.status(401).json({ error: 'Invalid or expired token' });
        }

        // Attach user and authenticated client to request
        req.user = result.user;
        req.supabaseClient = result.client;

        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        return res.status(500).json({ error: 'Authentication error' });
    }
}

/**
 * Optional auth middleware - doesn't fail if no token provided.
 * Useful for routes that work with or without authentication.
 */
export async function optionalAuthMiddleware(req: Request, res: Response, next: NextFunction) {
    try {
        const authHeader = req.headers.authorization;

        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            const result = await getUserFromToken(token);

            if (result) {
                req.user = result.user;
                req.supabaseClient = result.client;
            }
        }

        next();
    } catch (error) {
        // Don't fail, just continue without auth
        next();
    }
}
