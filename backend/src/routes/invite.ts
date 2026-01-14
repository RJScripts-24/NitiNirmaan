import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';

export const inviteRouter = Router();

inviteRouter.post('/', authMiddleware, async (req, res) => {
    try {
        const { email, projectId, role } = req.body;

        if (!email || !projectId) {
            return res.status(400).json({ error: 'Missing email or projectId' });
        }

        const supabase = req.supabaseClient! as any;
        const user = req.user!;

        // 1. Check if user making request is OWNER
        const { data: project } = await supabase
            .from('projects')
            .select('user_id')
            .eq('id', projectId)
            .single();

        if (project?.user_id !== user.id) {
            return res.status(403).json({ error: 'Only Project Owner can invite' });
        }

        // 2. Find the user to invite by Email
        // Note: In Supabase, searching auth.users directly needs Admin Key. 
        // For Hackathon, we search the 'profiles' table which is replicable.
        const { data: targetProfile } = await supabase
            .from('profiles')
            .select('id')
            .eq('email', email)
            .single();

        if (!targetProfile) {
            return res.status(404).json({ error: 'User not found on NitiNirmaan. Ask them to sign up first.' });
        }

        // 3. Add to Project Members
        const { error } = await supabase
            .from('project_members')
            .insert({
                project_id: projectId,
                user_id: targetProfile.id,
                role: role || 'viewer',
            });

        if (error) {
            if (error.code === '23505') { // Unique violation
                return res.status(409).json({ error: 'User is already a member' });
            }
            throw error;
        }

        res.status(200).json({ message: 'Invitation Sent' });

    } catch (error) {
        console.error('Invite Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
