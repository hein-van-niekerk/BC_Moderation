

// Main backend entry point. Sets up Express server and API routes for moderation dashboard.
import express from 'express';
import cors from 'cors';
import { login as doLogin, authMiddleware } from './auth';
import sql, { poolPromise } from './db';

const app = express();
app.use(cors());
app.use(express.json());
// Endpoint: Get all modules assigned to a lecturer
// Uses lecturer_id from JWT to fetch modules from DB
app.get('/api/modules/lecturer', authMiddleware('Lecturer'), async (req: any, res) => {
  try {
    const lecturerId = req.user.id;
    console.log('Lecturer modules endpoint called for lecturerId:', lecturerId);
    const pool = await poolPromise;
    if (!pool) throw new Error('Database connection failed');
    const result = await pool.request()
      .input('lecturer_id', sql.Int, lecturerId)
      .query(`
        SELECT m.module_code, m.module_name
        FROM ModuleLecturers ml
        JOIN Modules m ON ml.module_code = m.module_code
        WHERE ml.lecturer_id = @lecturer_id
      `);
    console.log('Modules found for lecturer:', result.recordset);
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch modules for lecturer' });
  }
});

// Endpoint: Get all modules for a department head's department
// Uses department_id from JWT, joins Lecturers, ModuleLecturers, Modules
app.get('/api/modules/department', authMiddleware('Department Head'), async (req: any, res) => {
  try {
    const pool = await poolPromise;
    if (!pool) throw new Error('Database connection failed');
    // Get department_id for this department head
    const r = await pool.request()
      .input('lecturer_id', sql.Int, req.user.id)
      .query('SELECT department_id FROM Lecturers WHERE lecturer_id = @lecturer_id');
    const departmentId = r.recordset[0]?.department_id;
    if (!departmentId) return res.status(400).json({ message: 'No department found for user' });
    const result = await pool.request()
      .input('department_id', sql.Int, departmentId)
      .query(`
        SELECT DISTINCT m.module_code, m.module_name
        FROM Modules m
        JOIN ModuleLecturers ml ON m.module_code = ml.module_code
        JOIN Lecturers l ON ml.lecturer_id = l.lecturer_id
        WHERE l.department_id = @department_id
      `);
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch modules for department' });
  }
});

// Endpoint: User login
// Authenticates user and returns JWT if credentials are valid
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const r = await doLogin(email, password);
  console.log('Login attempt:', { email, password });
  if (!r) {
    console.log('Login failed for:', email);
    return res.status(401).json({ message: 'Invalid credentials or role' });
  }
  console.log('Login success, JWT payload:', r.user);
  res.json(r);
});


// Endpoint: NQF analysis for a module
// Calculates Bloom's taxonomy and NQF level based on all assessments for a module
app.get('/api/modules/:moduleId/nqf-analysis', authMiddleware(), async (req, res) => {
  const { moduleId } = req.params;
  try {
    const pool = await poolPromise;
    if (!pool) throw new Error('Database connection failed');
    // Get all assessments for this module
    const assessments = await pool.request()
      .input('module_code', sql.VarChar, moduleId)
      .query('SELECT assessment_id FROM Assessments WHERE module_code = @module_code');
    let allQuestions: any[] = [];
    for (const a of assessments.recordset) {
      const qResult = await pool.request()
        .input('assessment_id', sql.Int, a.assessment_id)
        .query(`
          SELECT q.question_id, q.question_text, q.difficulty_level, q.topic_id
          console.log('Lecturer modules endpoint called for lecturerId:', lecturerId, 'user:', req.user);
          JOIN Questions q ON aq.question_id = q.question_id
          WHERE aq.assessment_id = @assessment_id
        `);
      allQuestions = allQuestions.concat(qResult.recordset);
    }
    // Compute NQF analysis (mimic old logic)
    const blooms = ['Recall', 'Comprehension', 'Application', 'Analysis', 'Evaluation', 'Creation'];
    const totals: Record<string, number> = {};
    let total = 0;
    for (const b of blooms) totals[b] = 0;
    for (const q of allQuestions) {
      if (totals[q.difficulty_level] !== undefined) totals[q.difficulty_level]++;
      total++;
    }
    const percents: Record<string, number> = {};
    for (const b of blooms) percents[b] = total ? Math.round((totals[b] / total) * 100) : 0;
    // Estimate NQF
    const weights: Record<string, number> = { Recall: 1, Comprehension: 2, Application: 3, Analysis: 4, Evaluation: 5, Creation: 6 };
    let score = 0;
    for (const q of allQuestions) score += weights[q.difficulty_level] || 0;
    const avg = total ? score / total : 0;
    let estimatedNqf = 5;
    if (avg >= 3.5 && avg < 5) estimatedNqf = 6;
    if (avg >= 5) estimatedNqf = 7;
    res.json({ totals, percents, estimatedNqf });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to compute NQF analysis' });
  }
});

// Endpoint: Get all assessments (tests) for a module
// Returns list of assessments for a given module from DB
app.get('/api/modules/:moduleId/tests', authMiddleware(), async (req, res) => {
  const { moduleId } = req.params;
  try {
    const pool = await poolPromise;
    if (!pool) throw new Error('Database connection failed');
    // Check if module exists
    const modResult = await pool.request()
      .input('module_code', sql.VarChar, moduleId)
      .query('SELECT * FROM Modules WHERE module_code = @module_code');
    if (!modResult.recordset || modResult.recordset.length === 0) {
      return res.status(404).json({ message: 'Module not found' });
    }
    // Get assessments for this module
    const result = await pool.request()
      .input('module_code', sql.VarChar, moduleId)
      .query('SELECT assessment_id AS id, assessment_name AS title, assessment_type, due_date, Location FROM Assessments WHERE module_code = @module_code');
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch assessments for module' });
  }
});

// Endpoint: Get details and analysis for a specific test/assessment
// Returns assessment info, questions, topic coverage, Bloom's breakdown, NQF analysis
app.get('/api/tests/:testId', authMiddleware(), async (req, res) => {
  const { testId } = req.params;
  try {
    const pool = await poolPromise;
    if (!pool) throw new Error('Database connection failed');
    // Get assessment
    const assessResult = await pool.request()
      .input('assessment_id', sql.Int, testId)
      .query('SELECT * FROM Assessments WHERE assessment_id = @assessment_id');
    if (!assessResult.recordset || assessResult.recordset.length === 0) {
      return res.status(404).json({ message: 'Test not found' });
    }
  const assessment = assessResult.recordset[0];
  // Expose assessment_type for frontend logic
  const assessmentType = assessment.assessment_type ? assessment.assessment_type.toLowerCase() : '';
    // Get module NQF level (now always present)
    let moduleNqfLevel = null;
    if (assessment.module_code) {
      const modResult = await pool.request()
        .input('module_code', sql.VarChar, assessment.module_code)
        .query('SELECT nqf_level FROM Modules WHERE module_code = @module_code');
      if (modResult.recordset && modResult.recordset.length > 0) {
        moduleNqfLevel = modResult.recordset[0].nqf_level;
      }
    }
    // Get questions for this assessment
    const qResult = await pool.request()
      .input('assessment_id', sql.Int, testId)
      .query(`
        SELECT q.question_id, q.question_text, q.difficulty_level, t.topic_id, t.topic_description, q.Marks as marks
        FROM AssessmentQuestions aq
        JOIN Questions q ON aq.question_id = q.question_id
        JOIN Topics t ON q.topic_id = t.topic_id
        WHERE aq.assessment_id = @assessment_id
      `);
    assessment.questions = qResult.recordset;

    // Get all topics for the module (via ModuleTopics join),
    // Only use moduleTopics for topic coverage and missing topic analysis
    let allTopics: { topic_id: number, topic_description: string }[] = [];
    const moduleTopics: { topic_id: number, topic_description: string }[] = [];
    if (assessment.module_code) {
      const topicsResult = await pool.request()
        .input('module_code', sql.VarChar, assessment.module_code)
        .query(`
          SELECT t.topic_id, t.topic_description
          FROM ModuleTopics mt
          JOIN Topics t ON mt.topic_id = t.topic_id
          WHERE mt.module_code = @module_code
        `);
      moduleTopics.push(...topicsResult.recordset);
    }
    allTopics = [...moduleTopics];
    // Topics breakdown (include all module topics, even if not present in test)
    const topicTotals: { [key: string]: number } = {};
    for (const t of allTopics) {
      topicTotals[t.topic_description || 'Unknown'] = 0;
    }
    for (const q of assessment.questions) {
      const topic = q.topic_description || 'Unknown';
      if (topicTotals.hasOwnProperty(topic)) {
        topicTotals[topic] = (topicTotals[topic] || 0) + 1;
      }
    }
    const topicPercents: { [key: string]: number } = {};
    const topicTotalCount = assessment.questions.length;
    for (const topic in topicTotals) {
      topicPercents[topic] = topicTotalCount ? Math.round((topicTotals[topic] / topicTotalCount) * 100) : 0;
    }
    // Calculate topic coverage for frontend highlighting
    const totalTopics = allTopics.length;
    const coveredTopics = Object.values(topicTotals).filter(v => v > 0).length;
    let missingThreshold = null;
    let missingTopics: string[] = [];
    if (assessmentType === 'exam') {
      // Exams: highlight if more than 1/4 topics missing
      missingThreshold = Math.floor(totalTopics / 4);
      missingTopics = allTopics.filter(t => (topicTotals[t.topic_description || 'Unknown'] || 0) === 0).map(t => t.topic_description || 'Unknown');
      console.log(`[DEBUG] Exam: testId=${testId}, totalTopics=${totalTopics}, missingTopics=${missingTopics.length}, threshold=${missingThreshold}`);
    } else if (assessmentType === 'class test' || assessmentType === 'test') {
      // Class tests: only flag if more than 60% missing
      const allMissing = allTopics.filter(t => (topicTotals[t.topic_description || 'Unknown'] || 0) === 0).map(t => t.topic_description || 'Unknown');
      const threshold = Math.ceil(totalTopics * 0.6);
      // Only set missingTopics if ratio is NOT met (too many missing)
      if (allMissing.length > threshold) {
        missingTopics = allMissing;
        missingThreshold = threshold;
        console.log(`[DEBUG] Class Test: testId=${testId}, totalTopics=${totalTopics}, missingTopics=${allMissing.length}, threshold=${threshold} [FLAGGED]`);
      } else {
        // Ratio is met: show all topics and their coverage, but do not flag as missing
        missingTopics = [];
        missingThreshold = threshold;
        console.log(`[DEBUG] Class Test: testId=${testId}, totalTopics=${totalTopics}, missingTopics=${allMissing.length}, threshold=${threshold} [OK]`);
      }
    }
    // Bloom's taxonomy (difficulty) breakdown
    const blooms = ['Recall', 'Comprehension', 'Application', 'Analysis', 'Evaluation', 'Creation'];
    const totals: { [key: string]: number } = {};
    let total = 0;
    for (const b of blooms) totals[b] = 0;
    let weightedScore = 0;
    let totalMarks = 0;
    const weights: { [key: string]: number } = { Recall: 1, Comprehension: 2, Application: 3, Analysis: 4, Evaluation: 5, Creation: 6 };
    for (const q of assessment.questions) {
      if (typeof q.difficulty_level === 'string' && totals[q.difficulty_level] !== undefined) totals[q.difficulty_level]++;
      // Use q.marks or q.mark or default to 1 if not present
      const marks = typeof q.marks === 'number' ? q.marks : (typeof q.mark === 'number' ? q.mark : 1);
      weightedScore += (weights[q.difficulty_level] || 0) * marks;
      totalMarks += marks;
      total++;
    }
    const percents: { [key: string]: number } = {};
    for (const b of blooms) percents[b] = total ? Math.round((totals[b] / total) * 100) : 0;
    // Estimate NQF using weighted Bloom score
    const weightedAvg = totalMarks ? weightedScore / totalMarks : 0;
    let estimatedNqf = 5;
    if (weightedAvg >= 3.5 && weightedAvg < 5) estimatedNqf = 6;
    if (weightedAvg >= 5) estimatedNqf = 7;
    // Compare estimated NQF to module NQF
    let nqfMatch = null;
    if (moduleNqfLevel !== null) {
      nqfMatch = (estimatedNqf === moduleNqfLevel) ? 'Match' : (estimatedNqf > moduleNqfLevel ? 'Above' : 'Below');
    }
    res.json({
      test: { ...assessment, assessment_type: assessment.assessment_type },
      analysis: {
        topics: { totals: topicTotals, percents: topicPercents, missing: missingTopics, totalTopics, coveredTopics, missingThreshold, assessmentType },
        blooms: { totals, percents },
        estimatedNqf,
        moduleNqfLevel,
        nqfMatch
      },
      moduleTopics: moduleTopics.map(t => t.topic_description || 'Unknown')
    });
  } catch (err: any) {
    console.error('Assessment details error:', err);
    res.status(500).json({ message: 'Failed to fetch assessment details', error: err && err.message ? err.message : String(err) });
  }
});




// Start the Express server
const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`Backend listening on ${port}`));
