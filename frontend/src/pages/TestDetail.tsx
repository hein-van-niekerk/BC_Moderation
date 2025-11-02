
import React, { useEffect, useState } from 'react';
import Footer from '../components/Footer';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { generateModerationReportDocx } from '../utils/generateModerationReport';

function TestDetail() {
  const { testId } = useParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchAnalysis = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    const r = await axios.get(`http://localhost:4000/api/tests/${testId}`, { headers: { Authorization: `Bearer ${token}` } });
    setData(r.data);
    setLoading(false);
  };

  // Extract data from the response
  const test = data?.test || {};
  const analysis = data?.analysis || {};
  // Always show all module topics (from backend: topics.totals keys),
  // but if missing or empty, aggregate from questions array as fallback
  let topics: string[] = [];
  let topicTotals: { [key: string]: number } = {};
  let topicPercents: { [key: string]: number } = {};
  let missingTopics: string[] = [];
  let missingThreshold: number | undefined = undefined;
  let assessmentType: string = test.assessment_type || 'exam';
  let totalMarks = 0;
  // Always use moduleTopics from backend if present
  let moduleTopics: string[] = Array.isArray(data?.moduleTopics) ? data.moduleTopics : [];
  // Build topicTotals and topicPercents for all moduleTopics
  moduleTopics.forEach((t) => { topicTotals[t] = 0; });
  if (test.questions && test.questions.length > 0) {
    test.questions.forEach((q: any) => {
      if (q.topic_description && topicTotals.hasOwnProperty(q.topic_description)) {
        topicTotals[q.topic_description] = (topicTotals[q.topic_description] || 0) + (q.marks ?? q.mark ?? 1);
        totalMarks += (q.marks ?? q.mark ?? 1);
      }
    });
  }
  topics = moduleTopics;
  topics.forEach((t) => {
    topicPercents[t] = totalMarks > 0 ? Math.round((topicTotals[t] || 0) / totalMarks * 100) : 0;
  });
  missingTopics = topics.filter((t) => (topicTotals[t] || 0) === 0);

  useEffect(() => {
    fetchAnalysis();
  }, [testId]);

  // Debug: log topics, topicTotals, and data for troubleshooting
  // console.log('[DEBUG FRONTEND] topics:', topics);
  // console.log('[DEBUG FRONTEND] topicTotals:', topicTotals);
  // console.log('[DEBUG FRONTEND] data:', data);
  return (
    <>
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #fff 0%, #e5e5e5 100%)' }}>
        {/* Header */}
        <div style={{
          width: '100%',
          background: '#111',
          display: 'flex',
          alignItems: 'center',
          padding: 0,
          height: 80,
          boxShadow: '0 2px 8px 0 rgba(0,0,0,0.10)',
          marginBottom: 48,
        }}>
          <div
            style={{
              marginLeft: 32,
              marginRight: 20,
              background: '#fff',
              border: '2px solid #d32f2f',
              borderRadius: 8,
              padding: 6,
              display: 'flex',
              alignItems: 'center',
              boxShadow: '0 2px 8px 0 rgba(211,47,47,0.10)'
            }}
            title="Go to landing page"
          >
            <img src="/belgium.png" alt="Belgium Campus Logo" style={{ height: 48, width: 'auto', display: 'block' }} />
          </div>
          <h1 style={{
            color: '#fff',
            fontWeight: 700,
            fontSize: 28,
            letterSpacing: 1,
            margin: 0,
            paddingLeft: 12,
            fontFamily: 'Segoe UI',
          }}>
            Test Analysis
          </h1>
        </div>
        {/* Card */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 'calc(100vh - 80px)',
        }}>
          <div style={{
            background: '#fff',
            border: '1px solid #d3d3d3',
            borderRadius: 12,
            boxShadow: '0 4px 24px 0 rgba(0,0,0,0.10), 0 1.5px 4px 0 rgba(255,0,0,0.10)',
            padding: '36px 32px 28px 32px',
            minWidth: 340,
            maxWidth: 500,
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}>
            <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', marginBottom: 18 }}>
              <button
                onClick={() => navigate('/modules')}
                style={{
                  background: '#fff',
                  color: '#d32f2f',
                  border: '2px solid #d32f2f',
                  borderRadius: 6,
                  padding: '6px 18px',
                  fontWeight: 700,
                  fontSize: 15,
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px 0 rgba(211,47,47,0.10)',
                  marginRight: 8,
                  transition: 'background 0.2s, color 0.2s',
                }}
                onMouseOver={e => (e.currentTarget.style.background = '#d32f2f', e.currentTarget.style.color = '#fff')}
                onMouseOut={e => (e.currentTarget.style.background = '#fff', e.currentTarget.style.color = '#d32f2f')}
              >
                Back
              </button>
              <button
                onClick={fetchAnalysis}
                disabled={loading}
                style={{
                  background: loading ? '#fbc02d' : '#d32f2f',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 6,
                  padding: '6px 18px',
                  fontWeight: 700,
                  fontSize: 15,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  boxShadow: '0 2px 8px 0 rgba(211,47,47,0.10)',
                  marginLeft: 8,
                  opacity: loading ? 0.7 : 1,
                  transition: 'background 0.2s, opacity 0.2s',
                }}
              >
                {loading ? 'Recalculating...' : 'Recalculate'}
              </button>
            </div>
            <h2 style={{ color: '#d32f2f', fontWeight: 700, marginBottom: 16, letterSpacing: 1 }}>{test.title}</h2>
            <div style={{ marginBottom: 16, width: '100%', display: 'flex', flexDirection: 'row', alignItems: 'flex-end', gap: 32 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: '#222', marginBottom: 2 }}>Estimated NQF</div>
                <div style={{ fontSize: 16, fontWeight: 400, color: '#222' }}>{analysis?.estimatedNqf}</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: '#222', marginBottom: 2 }}>Module NQF</div>
                <div style={{ fontSize: 16, fontWeight: 400, color: '#222' }}>{analysis?.moduleNqfLevel}</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: '#222', marginBottom: 2 }}>NQF Match</div>
                <div style={{ fontSize: 16, fontWeight: 400, color: (analysis?.nqfMatch === 'Match' ? '#388e3c' : '#d32f2f') }}>{analysis?.nqfMatch}</div>
              </div>
            </div>
            <h3 style={{ color: '#222', marginBottom: 8, alignSelf: 'flex-start' }}>Topics</h3>
            <ul style={{ width: '100%', marginBottom: 18, paddingLeft: 0 }}>
              {topics.length === 0 ? (
                <li>No topics found</li>
              ) : (
                topics.map((t: string) => {
                  const percent: number = topicPercents[t] || 0;
                  let color: string = '#388e3c';
                  let fontWeight: number = 500;
                  const isMissing: boolean = (topicTotals[t] || 0) === 0;
                  // Highlight in red if missing and outside allowed ratio
                  if (assessmentType === 'exam' && isMissing && missingTopics.length > (missingThreshold ?? 0)) {
                    color = '#d32f2f';
                    fontWeight = 700;
                  }
                  return (
                    <li key={t} style={{ color, fontWeight, listStyle: 'none', marginBottom: 2 }}>
                      {t} (<span style={{ color, fontWeight: 700 }}>{percent}%</span>)
                      {assessmentType === 'exam' && isMissing && missingTopics.length > (missingThreshold ?? 0) && (
                        <span style={{ color: '#d32f2f', fontWeight: 700, marginLeft: 8 }}>[Missing]</span>
                      )}
                      {assessmentType !== 'exam' && isMissing && (
                        <span style={{ color: '#888', fontWeight: 500, marginLeft: 8 }}>[Not in test]</span>
                      )}
                    </li>
                  );
                })
              )}
            </ul>
            <h3 style={{ color: '#222', marginBottom: 8, alignSelf: 'flex-start' }}>Difficulty distribution (percent)</h3>
            <ul style={{ width: '100%' }}>
              {Object.entries(analysis?.blooms?.percents || {}).map(([k, v]) => (
                <li key={k}>{k}: {String(v)}%</li>
              ))}
            </ul>

            <h3 style={{ color: '#222', margin: '18px 0 8px 0', alignSelf: 'flex-start' }}>Questions (Detailed)</h3>
            <div style={{ width: '100%', overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 15 }}>
                <thead>
                  <tr style={{ background: '#f5f5f5' }}>
                    <th style={{ border: '1px solid #ddd', padding: 6, fontWeight: 600 }}>#</th>
                    <th style={{ border: '1px solid #ddd', padding: 6, fontWeight: 600 }}>Question</th>
                    <th style={{ border: '1px solid #ddd', padding: 6, fontWeight: 600 }}>Bloom Level</th>
                    <th style={{ border: '1px solid #ddd', padding: 6, fontWeight: 600 }}>Topic</th>
                    <th style={{ border: '1px solid #ddd', padding: 6, fontWeight: 600 }}>Marks</th>
                  </tr>
                </thead>
                <tbody>
                  {(test.questions || []).map((q: any, idx: number) => (
                    <tr key={q.question_id || idx}>
                      <td style={{ border: '1px solid #ddd', padding: 6 }}>{idx + 1}</td>
                      <td style={{ border: '1px solid #ddd', padding: 6 }}>{q.question_text}</td>
                      <td style={{ border: '1px solid #ddd', padding: 6 }}>{q.difficulty_level}</td>
                      <td style={{ border: '1px solid #ddd', padding: 6 }}>{q.topic_description || q.topic_id || 'Unknown'}</td>
                      <td style={{ border: '1px solid #ddd', padding: 6 }}>{q.marks ?? q.mark ?? 1}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button
              onClick={() => generateModerationReportDocx(test, analysis)}
              style={{
                background: '#1976d2',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                padding: '6px 18px',
                fontWeight: 700,
                fontSize: 15,
                cursor: 'pointer',
                boxShadow: '0 2px 8px 0 rgba(25,118,210,0.10)',
                marginLeft: 8,
                marginBottom: 12,
                marginTop: 40,
                transition: 'background 0.2s',
              }}
            >
              Generate Moderation Report
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default TestDetail;
