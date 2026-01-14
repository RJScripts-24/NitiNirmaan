import { Router } from 'express';
import { supabase } from '../lib/supabase.js';

export const authRouter = Router();

// --- SIGNUP ---
authRouter.post('/signup', async (req, res) => {
    try {
        const { email, password, fullName, orgName } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // Create User in Supabase Auth
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                    org_name: orgName,
                    gamification_level: 'Level 1: Novice Architect', // Initial Gamification Level
                },
                emailRedirectTo: `${process.env.FRONTEND_URL || process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
            },
        });

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        // Return session if available (email confirmation disabled)
        if (data.session) {
            return res.json({
                message: 'Signup successful',
                user: data.user,
                token: data.session.access_token, // Map session.access_token -> token
            });
        }

        // If email confirmation is enabled
        res.json({ message: 'Check your email to continue the NitiNirmaan quest.' });

    } catch (error) {
        console.error('Signup Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// --- LOGIN ---
authRouter.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            return res.status(401).json({ error: error.message });
        }

        res.json({
            message: 'Login successful',
            user: data.user,
            token: data.session.access_token, // Map session.access_token -> token
        });

    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// --- LOGOUT ---
authRouter.post('/logout', async (req, res) => {
    try {
        const { error } = await supabase.auth.signOut();

        if (error) {
            return res.status(500).json({ error: error.message });
        }

        res.json({ message: 'Logged out successfully' });

    } catch (error) {
        console.error('Logout Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// --- FORGOT PASSWORD ---
authRouter.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${process.env.FRONTEND_URL || process.env.NEXT_PUBLIC_SITE_URL}/update-password`,
        });

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.json({ message: 'Recovery magic link sent to your email.' });

    } catch (error) {
        console.error('Forgot Password Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// --- GOOGLE OAUTH (Returns OAuth URL) ---
authRouter.post('/google', async (req, res) => {
    try {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${process.env.FRONTEND_URL || process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
            },
        });

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.json({ url: data.url }); // This remains as is, frontend follows URL

    } catch (error) {
        console.error('Google OAuth Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// --- REFRESH TOKEN ---
authRouter.post('/refresh', async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({ error: 'Refresh token is required' });
        }

        const { data, error } = await supabase.auth.refreshSession({ refresh_token: refreshToken });

        if (error) {
            return res.status(401).json({ error: error.message });
        }

        res.json({
            token: data.session?.access_token,
            user: data.user,
        });

    } catch (error) {
        console.error('Refresh Token Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
