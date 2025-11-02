// Utility to generate a moderation report docx file for a test analysis
import { saveAs } from 'file-saver';
import { Document, Packer, Paragraph, Table, TableCell, TableRow, WidthType } from 'docx';

type Question = {
  question_id: number;
  topic_description: string;
  difficulty_level: string;
  marks?: number;
};

type Test = {
  title: string;
  questions: Question[];
};

type Analysis = {
  topics: {
    totals: Record<string, number>;
  };
};

export async function generateModerationReportDocx(test: Test, analysis: Analysis) {
  // Build table rows for each topic/criteria
  const topicRows = Object.keys(analysis.topics.totals).map(topic => {
    const cells = [
      new TableCell({
        children: [new Paragraph({ text: topic })],
        width: { size: 4000, type: WidthType.DXA },
      }),
      ...['Recall', 'Comprehension', 'Application', 'Analysis', 'Evaluation', 'Creation'].map(level => {
        // Find questions for this topic and level
        const questions = (test.questions || []).filter((q: Question) => (q.topic_description === topic) && (q.difficulty_level === level));
        const qText = questions.map((q: Question) => `Q${q.question_id}[${q.marks || 1}]`).join(', ');
        return new TableCell({
          children: [new Paragraph(qText)],
          width: { size: 1200, type: WidthType.DXA },
        });
      }),
      // Sum of marks for all questions in this topic
      new TableCell({
        children: [
          new Paragraph(String((test.questions || []).filter((q: Question) => q.topic_description === topic).reduce((sum, q) => sum + (q.marks || 1), 0)))
        ],
        width: { size: 1200, type: WidthType.DXA },
      })
    ];
    return new TableRow({ children: cells });
  });

  // Table header
  const headerRow = new TableRow({
    children: [
      new TableCell({ children: [new Paragraph('Assessment Criteria')], width: { size: 4000, type: WidthType.DXA } }),
      ...['1 Recall', '2 Comprehension', '3 Application', '4 Analysis', '5 Evaluation', '6 Creation'].map(h =>
        new TableCell({ children: [new Paragraph(h)], width: { size: 1200, type: WidthType.DXA } })
      ),
      new TableCell({ children: [new Paragraph('Total Allocated Marks')], width: { size: 1200, type: WidthType.DXA } })
    ]
  });

  // Totals row
  const totalMarks = (test.questions || []).reduce((sum: number, q: Question) => sum + (q.marks || 1), 0);
  const recall = (test.questions || []).filter((q: Question) => q.difficulty_level === 'Recall').reduce((sum: number, q: Question) => sum + (q.marks || 1), 0);
  const comprehension = (test.questions || []).filter((q: Question) => q.difficulty_level === 'Comprehension').reduce((sum: number, q: Question) => sum + (q.marks || 1), 0);
  const application = (test.questions || []).filter((q: Question) => q.difficulty_level === 'Application').reduce((sum: number, q: Question) => sum + (q.marks || 1), 0);
  const analysisTotal = (test.questions || []).filter((q: Question) => q.difficulty_level === 'Analysis').reduce((sum: number, q: Question) => sum + (q.marks || 1), 0);
  const evaluation = (test.questions || []).filter((q: Question) => q.difficulty_level === 'Evaluation').reduce((sum: number, q: Question) => sum + (q.marks || 1), 0);
  const creation = (test.questions || []).filter((q: Question) => q.difficulty_level === 'Creation').reduce((sum: number, q: Question) => sum + (q.marks || 1), 0);

  const totalRow = new TableRow({
    children: [
      new TableCell({ children: [new Paragraph('Total:')], width: { size: 4000, type: WidthType.DXA } }),
      new TableCell({ children: [new Paragraph(String(recall))], width: { size: 1200, type: WidthType.DXA } }),
      new TableCell({ children: [new Paragraph(String(comprehension))], width: { size: 1200, type: WidthType.DXA } }),
      new TableCell({ children: [new Paragraph(String(application))], width: { size: 1200, type: WidthType.DXA } }),
      new TableCell({ children: [new Paragraph(String(analysisTotal))], width: { size: 1200, type: WidthType.DXA } }),
      new TableCell({ children: [new Paragraph(String(evaluation))], width: { size: 1200, type: WidthType.DXA } }),
      new TableCell({ children: [new Paragraph(String(creation))], width: { size: 1200, type: WidthType.DXA } }),
      new TableCell({ children: [new Paragraph(String(totalMarks))], width: { size: 1200, type: WidthType.DXA } })
    ]
  });

  // Table with totals row included
  const table = new Table({
    rows: [headerRow, ...topicRows, totalRow],
    width: { size: 100, type: WidthType.PERCENTAGE },
  });

  // Document
  const doc = new Document({
    sections: [
      {
        children: [
          new Paragraph({ text: test.title, heading: 'Heading1' }),
          table
        ]
      }
    ]
  });

  const blob = await Packer.toBlob(doc);
  const safeTitle = (test.title && typeof test.title === 'string') ? test.title.replace(/\s+/g, '_') : 'Test';
  saveAs(blob, `${safeTitle}_Moderation_Report.docx`);
}
