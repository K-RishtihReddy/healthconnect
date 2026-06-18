import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { Activity, Mail, Lock, ShieldAlert } from 'lucide-react';

const Login = () => {
  const { login, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // If already logged in, redirect
  useEffect(() => {
    if (user) {
      const from = location.state?.from?.pathname || getDashboardLink(user.role);
      navigate(from, { replace: true });
    }
  }, [user]);

  const getDashboardLink = (role) => {
    if (role === 'admin') return '/admin';
    if (role === 'doctor') return '/doctor';
    return '/patient';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide email and password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await login(email, password);
      // Redirect is handled by the useEffect above
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Invalid email or password.');
      setLoading(false);
    }
  };

  return (
    <div className="container py-5 d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
      <div className="card border p-4 shadow-sm w-100 animate-fade-in-up" style={{ maxWidth: '420px', borderRadius: '20px', background: '#fff' }}>
        <div className="text-center mb-4">
          <div className="bg-primary-light text-primary d-inline-flex p-3 rounded-circle mb-3" style={{ background: 'rgba(79, 70, 229, 0.1)' }}>
            <Activity size={32} />
          </div>
          <h3 className="fw-bold">Sign In</h3>
          <p className="text-muted small">Welcome back to HealthConnect management panel</p>
        </div>

        <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
          {error && (
            <div className="alert alert-danger d-flex align-items-center gap-2 small p-2" role="alert">
              <ShieldAlert size={16} />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="form-label small fw-semibold text-muted">Email Address</label>
            <div className="input-group border rounded px-2 py-1 bg-white">
              <Mail size={18} className="text-muted align-self-center me-2" />
              <input
                type="email"
                className="form-control border-0 p-1"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ fontSize: '14px', boxShadow: 'none' }}
                required
              />
            </div>
          </div>

          <div>
            <label className="form-label small fw-semibold text-muted">Password</label>
            <div className="input-group border rounded px-2 py-1 bg-white">
              <Lock size={18} className="text-muted align-self-center me-2" />
              <input
                type="password"
                className="form-control border-0 p-1"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ fontSize: '14px', boxShadow: 'none' }}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary py-2 text-white w-100 mt-2" disabled={loading}>
            {loading ? 'Signing In...' : 'Login'}
          </button>
        </form>

        <div className="text-center mt-4 border-top pt-3">
          <p className="small text-muted mb-0">
            Don't have an account? <Link to="/register" className="text-primary fw-medium text-decoration-none">Sign Up</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
