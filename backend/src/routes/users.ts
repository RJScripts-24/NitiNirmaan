import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import multer from 'multer';

export const usersRouter = Router();

// Configure multer for file uploads
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// --- GET USER PROFILE ---
usersRouter.get('/profile', authMiddleware, async (req, res) => {
    try {
        const supabase = req.supabaseClient!;
        const user = req.user!;

        const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        if (error) {
            console.error('Fetch Profile Error:', error);
            return res.status(404).json({ error: 'Profile not found' });
        }

        res.json(profile);

    } catch (error) {
        console.error('Get Profile Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// --- UPDATE PROFILE ---
usersRouter.put('/profile', authMiddleware, upload.single('logo'), async (req, res) => {
    try {
        const supabase = req.supabaseClient!;
        const user = req.user!;

        const { fullName, orgName, website } = req.body;
        let logoUrl = null;

        // Handle Logo Upload (If a new file is provided)
        if (req.file) {
            // Validate File Type
            if (!req.file.mimetype.startsWith('image/')) {
                return res.status(400).json({ error: 'Invalid file type. Please upload an image.' });
            }

            // Generate Unique Path
            const filePath = `${user.id}/logo-${Date.now()}.${req.file.originalname.split('.').pop()}`;

            const { error: uploadError } = await supabase.storage
                .from('org-assets')
                .upload(filePath, req.file.buffer, {
                    upsert: true,
                    contentType: req.file.mimetype,
                });

            if (uploadError) {
                console.error('Logo Upload Error:', uploadError);
                return res.status(500).json({ error: 'Failed to upload logo.' });
            }

            // Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('org-assets')
                .getPublicUrl(filePath);

            logoUrl = publicUrl;
        }

        // Update Database
        const updateData: any = {
            full_name: fullName,
            org_name: orgName,
            updated_at: new Date().toISOString(),
        };

        // Only update logo_url if a new one was uploaded
        if (logoUrl) {
            updateData.avatar_url = logoUrl;
        }

        const { error: updateError } = await supabase
            .from('profiles')
            .update(updateData)
            .eq('id', user.id);

        if (updateError) {
            return res.status(500).json({ error: 'Failed to update profile.' });
        }

        res.json({ message: 'Organization profile updated.' });

    } catch (error) {
        console.error('Update Profile Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// --- GET TEAM MEMBERS ---
usersRouter.get('/team', authMiddleware, async (req, res) => {
    try {
        const supabase = req.supabaseClient!;
        const user = req.user!;

        // Get Current User's Org
        const { data: userProfile } = await supabase
            .from('profiles')
            .select('org_name')
            .eq('id', user.id)
            .single();

        if (!userProfile?.org_name) {
            return res.json([]);
        }

        // Find others with the same Org Name
        const { data: team, error } = await supabase
            .from('profiles')
            .select('id, full_name, email, avatar_url, gamification_level')
            .eq('org_name', userProfile.org_name)
            .neq('id', user.id); // Exclude self

        if (error) {
            return res.json([]);
        }

        res.json(team || []);

    } catch (error) {
        console.error('Get Team Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// --- REMOVE TEAM MEMBER ---
usersRouter.delete('/team/:userId', authMiddleware, async (req, res) => {
    try {
        const supabase = req.supabaseClient!;
        const userIdToRemove = req.params.userId;

        // For MVP: We just set their Org Name to null, effectively kicking them out
        const { error } = await supabase
            .from('profiles')
            .update({ org_name: null })
            .eq('id', userIdToRemove);

        if (error) {
            return res.status(500).json({ error: 'Failed to remove member.' });
        }

        res.json({ message: 'Member removed from organization.' });

    } catch (error) {
        console.error('Remove Team Member Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
