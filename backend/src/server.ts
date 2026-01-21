import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import routes
import { rootRouter } from './routes/index.js';
import { chatRouter } from './routes/chat.js';
import { generateDeckRouter } from './routes/generate-deck.js';
import { generateWordRouter } from './routes/generate-word.js';
import { generatePdfRouter } from './routes/generate-pdf.js';
import { ingestDocumentRouter } from './routes/ingest-document.js';
import { inviteRouter } from './routes/invite.js';
import { authRouter } from './routes/auth.js';
import { projectsRouter } from './routes/projects.js';
import { simulationRouter } from './routes/simulation.js';
import { patternsRouter } from './routes/patterns.js';
import { usersRouter } from './routes/users.js';
import { analyzeLogicRouter } from './routes/analyze-logic.js';
import { aiAuditRouter } from './routes/ai-audit.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors({
    origin: (origin, callback) => {
        const allowedOrigins = [
            process.env.FRONTEND_URL,
            'http://localhost:3000',
            'http://localhost:5173'
        ];

        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        // Allow dynamic Vercel preview deployments
        if (allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
            return callback(null, true);
        }

        // Block others
        return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/', rootRouter);
app.use('/api/chat', chatRouter);
app.use('/api/generate-deck', generateDeckRouter);
app.use('/api/generate-word', generateWordRouter);
app.use('/api/generate-pdf', generatePdfRouter);
app.use('/api/ingest-document', ingestDocumentRouter);
app.use('/api/invite', inviteRouter);
app.use('/api/auth', authRouter);
app.use('/api/projects', projectsRouter);
app.use('/api/simulation', simulationRouter);
app.use('/api/patterns', patternsRouter);
app.use('/api/user', usersRouter);
app.use('/api/analyze-logic', analyzeLogicRouter);
app.use('/api/ai-audit', aiAuditRouter);

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Unhandled error:', err);
    if (!res.headersSent) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 NitiNirmaan API Server running on port ${PORT}`);
    console.log(`📍 Health check: http://localhost:${PORT}/`);
});

export default app;
