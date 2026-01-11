import { Router } from 'express';

export const rootRouter = Router();

rootRouter.get('/', (req, res) => {
    res.json({
        status: 'ok',
        service: 'NitiNirmaan API',
        timestamp: new Date().toISOString(),
        endpoints: [
            '/api/chat',
            '/api/generate-deck',
            '/api/generate-word',
            '/api/generate-pdf',
            '/api/ingest-document',
            '/api/invite',
            '/api/auth',
            '/api/projects',
            '/api/simulation',
            '/api/templates',
            '/api/users'
        ]
    });
});
