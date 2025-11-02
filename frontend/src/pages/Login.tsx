
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';


export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    try {
  const r = await axios.post('http://localhost:4000/api/auth/login', { email, password });
  localStorage.setItem('token', r.data.token);
  localStorage.setItem('user', JSON.stringify(r.data.user));
  navigate('/modules');
    } catch (err) {
      alert('Login failed');
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #fff 0%, #e5e5e5 100%)',
    }}>
      {/* Header */}
      <div style={{
        width: '100%',
        background: '#111',
        display: 'flex',
        alignItems: 'center',
        padding: '0 0 0 0',
        height: 80,
        boxShadow: '0 2px 8px 0 rgba(0,0,0,0.10)',
        marginBottom: 48,
      }}>
        <div style={{
          marginLeft: 32,
          marginRight: 20,
          background: '#fff',
          border: '2px solid #d32f2f',
          borderRadius: 8,
          padding: 6,
          display: 'flex',
          alignItems: 'center',
          boxShadow: '0 2px 8px 0 rgba(211,47,47,0.10)',
        }}>
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
          Belgium Campus Moderation Helper
        </h1>
      </div>
      {/* Centered Login Card */}
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
          maxWidth: 400,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}>
          <h2 style={{
            color: '#d32f2f',
            fontWeight: 700,
            marginBottom: 24,
            letterSpacing: 1,
          }}>Login</h2>
          <form onSubmit={submit} style={{ width: '100%' }}>
            <div style={{ marginBottom: 18 }}>
              <label style={{
                display: 'block',
                marginBottom: 6,
                color: '#222',
                fontWeight: 500,
              }}>Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #bdbdbd',
                  borderRadius: 6,
                  fontSize: 16,
                  outline: 'none',
                  marginBottom: 2,
                  background: '#fafafa',
                  color: '#222',
                  boxSizing: 'border-box',
                  transition: 'border 0.2s',
                }}
                required
              />
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={{
                display: 'block',
                marginBottom: 6,
                color: '#222',
                fontWeight: 500,
              }}>Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #bdbdbd',
                  borderRadius: 6,
                  fontSize: 16,
                  outline: 'none',
                  background: '#fafafa',
                  color: '#222',
                  boxSizing: 'border-box',
                  transition: 'border 0.2s',
                }}
                required
              />
            </div>
            <button
              type="submit"
              style={{
                width: '100%',
                padding: '12px 0',
                background: '#d32f2f',
                color: '#fff',
                fontWeight: 700,
                fontSize: 18,
                border: 'none',
                borderRadius: 6,
                boxShadow: '0 2px 8px 0 rgba(211,47,47,0.10)',
                cursor: 'pointer',
                letterSpacing: 1,
                transition: 'background 0.2s',
              }}
            >
              Login
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
