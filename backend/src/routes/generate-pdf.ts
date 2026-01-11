import { Router } from 'express';
import { transformGraphToLFA } from '../lib/utils/graph-transformer.js';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generatePdfRouter = Router();

generatePdfRouter.post('/', async (req, res) => {
    try {
        const { nodes, edges, projectTitle } = req.body;

        if (!nodes || !edges) {
            return res.status(400).json({ error: 'Missing graph data' });
        }

        // 1. Transform Visual Graph -> Logical Framework Matrix (Data Structure)
        const lfaData = transformGraphToLFA(projectTitle || 'Untitled Project', nodes, edges);

        // 2. Generate PDF (Server Side)
        const doc = new jsPDF();

        // Title
        doc.setFontSize(22);
        doc.setTextColor(40, 40, 40);
        doc.text('Common Logical Framework (LFA)', 14, 20);

        doc.setFontSize(16);
        doc.setTextColor(100, 100, 100);
        doc.text(`Project: ${lfaData.projectTitle}`, 14, 30);

        // LFA Matrix Table columns
        const columns = [
            { header: 'Level', dataKey: 'level' },
            { header: 'Narrative Summary', dataKey: 'summary' },
            { header: 'Indicators (OVI)', dataKey: 'indicators' },
            { header: 'Assumptions / Risks', dataKey: 'assumptions' },
        ];

        const rows: any[] = [];

        // Goal Row
        if (lfaData.goal) {
            rows.push({
                level: 'GOAL',
                summary: lfaData.goal.statement,
                indicators: lfaData.goal.indicators.join('\n• '),
                assumptions: '',
            });
        }

        // Outcomes Rows
        lfaData.outcomes.forEach(outcome => {
            rows.push({
                level: 'OUTCOME',
                summary: outcome.statement,
                indicators: outcome.indicators.join('\n• '),
                assumptions: outcome.assumptions || '',
            });
        });

        // Outputs Rows
        lfaData.outputs.forEach(output => {
            rows.push({
                level: 'OUTPUT',
                summary: output.statement,
                indicators: output.indicators.join('\n• '),
                assumptions: '',
            });
        });

        // Activities Rows
        // For Matrix, we often group activities. Here we list them.
        const activitySummary = lfaData.activities
            .map(a => `${a.action} (by ${a.assignedTo})`)
            .join('\n');

        // Inputs (Budget/Resources) mapped to Activities row in LFA
        const inputsSummary = lfaData.activities
            .flatMap(a => a.inputs)
            .filter((v, i, self) => self.indexOf(v) === i) // Unique inputs
            .join('\n');

        rows.push({
            level: 'ACTIVITIES',
            summary: activitySummary,
            indicators: `INPUTS:\n${inputsSummary}`, // In LFA, Indicators col for Activities often holds Inputs/Budget
            assumptions: lfaData.risks.join('\n• '),
        });

        // Generate Table
        autoTable(doc, {
            startY: 40,
            head: [columns.map(c => c.header)],
            body: rows.map(r => [r.level, r.summary, r.indicators, r.assumptions]),
            theme: 'grid',
            headStyles: { fillColor: [41, 128, 185], textColor: 255 },
            styles: { fontSize: 10, cellPadding: 3, overflow: 'linebreak' },
        });

        // Output as ArrayBuffer
        const pdfBuffer = doc.output('arraybuffer');

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${lfaData.projectTitle.replace(/\s+/g, '_')}_LFA.pdf"`);
        res.send(Buffer.from(pdfBuffer));

    } catch (error) {
        console.error('PDF Generation Error:', error);
        res.status(500).json({ error: 'Failed to generate LFA Document' });
    }
});
