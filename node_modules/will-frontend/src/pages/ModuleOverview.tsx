

import React, { useEffect, useState } from 'react';
import Footer from '../components/Footer';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function statusColor(status: string) {
  if (status === 'Action Needed') return '#d32f2f'; // red
  if (status === 'Attention Needed') return '#fbc02d'; // yellow
  return '#388e3c'; // green
}

export default function ModuleOverview() {
  const [modules, setModules] = useState<any[]>([]);
  const [selectedTests, setSelectedTests] = useState<Record<string, any[]>>({});
  const [openModules, setOpenModules] = useState<Record<string, boolean>>({});
  const [testStatus, setTestStatus] = useState<Record<string, string>>({});
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    // Try to get user role from localStorage (set after login)
    let role = null;
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      role = user.role;
    } catch {}
    let url = 'http://localhost:4000/api/modules/lecturer';
    if (role === 'Department Head') url = 'http://localhost:4000/api/modules/department';
    axios.get(url, { headers: { Authorization: `Bearer ${token}` } }).then(r => setModules(r.data));
  }, []);

  async function toggleTests(moduleId: string) {
    setOpenModules(prev => {
      const isOpen = !!prev[moduleId];
      // If closing, just close
      if (isOpen) return { ...prev, [moduleId]: false };
      // If opening, fetch tests if not already loaded
      if (!selectedTests[moduleId]) {
        (async () => {
          const token = localStorage.getItem('token');
          const r = await axios.get(`http://localhost:4000/api/modules/${moduleId}/tests`, { headers: { Authorization: `Bearer ${token}` } });
          // Map Location to edit_link for each test
          const testsWithEditLink = r.data.map((test: any) => ({ ...test, edit_link: test.Location }));
          setSelectedTests(prev2 => ({ ...prev2, [moduleId]: testsWithEditLink }));
          for (const test of testsWithEditLink) {
            try {
              const detail = await axios.get(`http://localhost:4000/api/tests/${test.id}`, { headers: { Authorization: `Bearer ${token}` } });
              const analysis = detail.data.analysis;
              let status = 'Sufficient';
              // NQF level check
              if (analysis && analysis.moduleNqfLevel != null && analysis.estimatedNqf != null) {
                if (analysis.estimatedNqf !== analysis.moduleNqfLevel) {
                  status = 'Attention Needed';
                }
              }
              // Topic balance check: if any topic > 40%, set to Attention Needed
              if (analysis && analysis.topics && analysis.topics.percents) {
                const topicPercents = analysis.topics.percents;
                for (const topic in topicPercents) {
                  if (topicPercents[topic] > 40) {
                    status = 'Attention Needed';
                  }
                }
              }
              // Exam topic coverage check: if exam and missing topics > threshold, set to Action Needed
              if (analysis && analysis.topics && analysis.topics.assessmentType === 'exam') {
                const missing = analysis.topics.missing || [];
                const missingThreshold = analysis.topics.missingThreshold || 0;
                if (missing.length > missingThreshold) {
                  status = 'Action Needed';
                }
              }
              // For class tests, only trigger Action Needed if missing topics > 60% (backend sets missing/missingThreshold accordingly)
              if (analysis && analysis.topics && (analysis.topics.assessmentType === 'class test' || analysis.topics.assessmentType === 'test')) {
                const missing = analysis.topics.missing || [];
                const missingThreshold = analysis.topics.missingThreshold;
                if (missingThreshold != null && missing.length > missingThreshold) {
                  status = 'Action Needed';
                }
              }
              // If both NQF and topic balance are bad, escalate to Action Needed
              if (analysis && analysis.moduleNqfLevel != null && analysis.estimatedNqf != null && analysis.estimatedNqf !== analysis.moduleNqfLevel) {
                if (analysis && analysis.topics && analysis.topics.percents) {
                  const topicPercents = analysis.topics.percents;
                  for (const topic in topicPercents) {
                    if (topicPercents[topic] > 40) {
                      status = 'Action Needed';
                    }
                  }
                }
              }
              setTestStatus(prev3 => ({ ...prev3, [test.id]: status }));
            } catch {
              setTestStatus(prev3 => ({ ...prev3, [test.id]: 'Action Needed' }));
            }
          }
        })();
      }
      return { ...prev, [moduleId]: true };
    });
  }

  return (
    <>
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #fff 0%, #e5e5e5 100%)', padding: 0 }}>
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
            flex: 1,
          }}>
            Module Overview
          </h1>
          <button
            onClick={() => {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              navigate('/');
            }}
            style={{
              marginRight: 32,
              background: '#d32f2f',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              padding: '8px 22px',
              fontWeight: 700,
              fontSize: 16,
              cursor: 'pointer',
              boxShadow: '0 2px 8px 0 rgba(211,47,47,0.10)',
              transition: 'background 0.2s',
            }}
          >
            Logout
          </button>
        </div>
        <div style={{
          maxWidth: 700,
          margin: '40px auto',
          background: '#fff',
          border: '1px solid #d3d3d3',
          borderRadius: 12,
          boxShadow: '0 4px 24px 0 rgba(0,0,0,0.10), 0 1.5px 4px 0 rgba(255,0,0,0.10)',
          padding: '36px 32px 28px 32px',
        }}>
          <h2 style={{ color: '#d32f2f', fontWeight: 700, marginBottom: 24, letterSpacing: 1 }}>Modules</h2>
          {modules.map(m => (
          <div key={m.module_code || m.id} style={{ border: '1px solid #eee', borderRadius: 8, padding: 18, marginBottom: 18, background: '#fafafa' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong style={{ color: '#d32f2f' }}>{m.module_code || m.code}</strong> — {m.module_name || m.title} {m.nqfLevel ? `(NQF ${m.nqfLevel})` : ''}
              </div>
              <div>
                <button
                  onClick={() => toggleTests(m.module_code || m.id)}
                  style={{
                    background: '#d32f2f',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 6,
                    padding: '8px 18px',
                    fontWeight: 700,
                    fontSize: 16,
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px 0 rgba(211,47,47,0.10)',
                  }}
                >
                  {openModules[m.module_code || m.id] ? 'Hide Tests' : 'Show Tests'}
                </button>
              </div>
            </div>
            {openModules[m.module_code || m.id] && selectedTests[m.module_code || m.id] && (
              <form style={{ marginTop: 18 }} onSubmit={e => e.preventDefault()}>
                <h4 style={{ color: '#222', marginBottom: 10 }}>Tests</h4>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  {selectedTests[m.module_code || m.id].map((t: any) => (
                    <div key={t.id} style={{ border: '1px solid #d3d3d3', borderRadius: 6, padding: 12, width: 260, background: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div style={{ fontWeight: 600, color: '#222', textAlign: 'center', width: '100%' }}>{t.title}</div>
                      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, marginTop: 14, width: '100%' }}>
                        <button
                          type="button"
                          onClick={() => navigate(`/tests/${t.id}`)}
                          style={{
                            background: statusColor(testStatus[t.id]),
                            color: '#fff',
                            border: 'none',
                            borderRadius: 6,
                            padding: '8px 12px',
                            fontWeight: 600,
                            fontSize: 15,
                            cursor: 'pointer',
                            letterSpacing: 1,
                            boxShadow: '0 2px 8px 0 rgba(211,47,47,0.10)',
                            transition: 'background 0.2s',
                          }}
                        >
                          {testStatus[t.id] || 'Loading...'}
                        </button>
                        <button
                          type="button"
                          style={{
                            background: t.edit_link ? '#1976d2' : '#aaa',
                            color: '#fff',
                            border: 'none',
                            borderRadius: 4,
                            padding: '6px 14px',
                            fontWeight: 500,
                            fontSize: 14,
                            cursor: t.edit_link ? 'pointer' : 'not-allowed',
                            letterSpacing: 0.5,
                            boxShadow: '0 1px 4px 0 rgba(25,118,210,0.10)',
                            transition: 'background 0.2s',
                          }}
                          onClick={() => { if (t.edit_link) window.open(t.edit_link, '_blank'); }}
                          disabled={!t.edit_link}
                        >
                          Edit
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </form>
            )}
          </div>
        ))}
        </div>
      </div>
      <Footer />
    </>
  );
}
