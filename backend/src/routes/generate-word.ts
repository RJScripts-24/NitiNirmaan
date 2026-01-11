import { Router } from 'express';
import { transformGraphToLFA } from '../lib/utils/graph-transformer.js';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType } from 'docx';

export const generateWordRouter = Router();

generateWordRouter.post('/', async (req, res) => {
    try {
        const { nodes, edges, projectTitle } = req.body;

        if (!nodes || !edges) {
            return res.status(400).json({ error: 'Missing graph data' });
        }

        // 1. Transform Data
        const lfaData = transformGraphToLFA(projectTitle || 'Untitled Project', nodes, edges);

        // 2. Create DOCX (using 'docx' library structure)
        // Rows builder
        const rows = [
            new TableRow({
                children: [
                    new TableCell({ children: [new Paragraph("Level")] }),
                    new TableCell({ children: [new Paragraph("Narrative Summary")] }),
                    new TableCell({ children: [new Paragraph("Indicators")] }),
                    new TableCell({ children: [new Paragraph("Assumptions")] }),
                ],
            }),
        ];

        // Helper to add row
        const addRow = (level: string, summary: string, ind: string[], ass: string) => {
            rows.push(
                new TableRow({
                    children: [
                        new TableCell({ children: [new Paragraph({ text: level, style: 'Strong' })] }),
                        new TableCell({ children: [new Paragraph(summary)] }),
                        new TableCell({ children: [new Paragraph(ind.join('\n• '))] }),
                        new TableCell({ children: [new Paragraph(ass)] }),
                    ],
                })
            );
        };

        if (lfaData.goal) addRow('GOAL', lfaData.goal.statement, lfaData.goal.indicators, '');

        lfaData.outcomes.forEach(o => addRow('OUTCOME', o.statement, o.indicators, o.assumptions || ''));
        lfaData.outputs.forEach(o => addRow('OUTPUT', o.statement, o.indicators, ''));

        const acts = lfaData.activities.map(a => `${a.action} (${a.assignedTo})`).join('\n');
        const inputs = lfaData.activities.flatMap(a => a.inputs).join('\n');
        addRow('ACTIVITIES', acts, [`INPUTS:\n${inputs}`], lfaData.risks.join('\n'));

        // Document Construction
        const doc = new Document({
            sections: [{
                properties: {},
                children: [
                    new Paragraph({
                        text: `Logical Framework: ${lfaData.projectTitle}`,
                        heading: HeadingLevel.TITLE,
                    }),
                    new Paragraph({ text: "" }), // Spacing
                    new Table({
                        rows: rows,
                        width: { size: 100, type: WidthType.PERCENTAGE },
                    }),
                ],
            }],
        });

        // 3. Generate Buffer
        const buffer = await Packer.toBuffer(doc);

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
        res.setHeader('Content-Disposition', `attachment; filename="${lfaData.projectTitle.replace(/\s+/g, '_')}_LFA.docx"`);
        res.send(Buffer.from(buffer));

    } catch (error) {
        console.error('Word Generation Error:', error);
        res.status(500).json({ error: 'Internal Error' });
    }
});
