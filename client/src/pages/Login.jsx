import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, Eye, EyeOff, AlertCircle, Lock, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const { login }               = useAuth();
  const navigate                = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (e, em, pw) => {
    e.preventDefault();
    setEmail(em);
    setPassword(pw);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--color-bg-primary)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background orbs */}
      <div style={{
        position: 'absolute', width: 500, height: 500,
        background: 'radial-gradient(circle, rgba(10,132,255,0.12) 0%, transparent 70%)',
        top: -100, left: -100, borderRadius: '50%', pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', width: 400, height: 400,
        background: 'radial-gradient(circle, rgba(191,90,242,0.08) 0%, transparent 70%)',
        bottom: -50, right: -50, borderRadius: '50%', pointerEvents: 'none',
      }} />

      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
        style={{ width: '100%', maxWidth: 440 }}
      >
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{
            width: 64, height: 64,
            background: 'linear-gradient(135deg, #0A84FF, #409CFF)',
            borderRadius: 18,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
            boxShadow: '0 8px 32px rgba(10,132,255,0.35)',
          }}>
            <Zap size={32} color="#fff" strokeWidth={2.5} />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.03em', margin: 0, color: 'var(--color-text-primary)' }}>
            TraceNet
          </h1>
          <p style={{ margin: '6px 0 0', color: 'var(--color-text-quaternary)', fontSize: '0.875rem' }}>
            Criminal Network Analysis System · MHA
          </p>
        </div>

        {/* Card */}
        <div className="glass-card" style={{ padding: '32px 28px' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 6px', color: 'var(--color-text-primary)' }}>
            Sign In
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-tertiary)', margin: '0 0 24px' }}>
            Authorized personnel only. All activity is logged.
          </p>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: 'rgba(255,69,58,0.1)', border: '1px solid rgba(255,69,58,0.25)',
                borderRadius: 'var(--radius-md)', padding: '10px 14px',
                color: 'var(--color-danger)', fontSize: '0.875rem', marginBottom: 16,
              }}
            >
              <AlertCircle size={16} />
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 6 }}>
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-quaternary)' }} />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="officer@tracenet.in"
                  required
                  className="input-field"
                  style={{ paddingLeft: 40 }}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 6 }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-quaternary)' }} />
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="input-field"
                  style={{ paddingLeft: 40, paddingRight: 44 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  style={{
                    position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-quaternary)',
                    padding: 0, display: 'flex',
                  }}
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <motion.button
              type="submit"
              className="btn-pill btn-primary"
              disabled={loading}
              whileTap={{ scale: 0.97 }}
              style={{ width: '100%', justifyContent: 'center', marginTop: 8, padding: '13px 20px' }}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className="skeleton" style={{ width: 16, height: 16, borderRadius: '50%' }} />
                  Authenticating…
                </span>
              ) : 'Sign In to TraceNet'}
            </motion.button>
          </form>

          {/* Demo credentials */}
          <div style={{ marginTop: 24 }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-quaternary)', textAlign: 'center', marginBottom: 10 }}>
              Demo Credentials
            </p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {[
                { label: 'Admin', em: 'admin@tracenet.in', pw: 'Admin@1234' },
                { label: 'Investigator', em: 'priya@tracenet.in', pw: 'Inv@12345' },
                { label: 'Analyst', em: 'shreya@tracenet.in', pw: 'Ana@12345' },
              ].map(d => (
                <button
                  key={d.label}
                  onClick={e => fillDemo(e, d.em, d.pw)}
                  className="btn-pill btn-ghost"
                  style={{ fontSize: '0.75rem', padding: '6px 12px', flex: 1 }}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: '0.75rem', color: 'var(--color-text-quaternary)' }}>
          All access is monitored and audited per MHA security policy.
        </p>
      </motion.div>
    </div>
  );
}
