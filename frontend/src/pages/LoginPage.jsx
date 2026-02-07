import { useState } from 'react';
import { useAuth } from '../services/AuthContext';
import { login, register, deleteAccount } from '../services/api';

export default function LoginPage() {
  const { setPlayer } = useAuth();
  const [step, setStep] = useState('login'); // 'login' | 'register' | 'delete'
  const [phoneOrEmail, setPhoneOrEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Registration fields
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    gender: 'Male',
    address: '',
    ntrp_level: '3.5',
    notification_preference: 'EmailMe',
  });

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await login(phoneOrEmail);
      setPlayer(res.data.player);
    } catch (err) {
      if (err.response?.status === 404) {
        // New user — prefill email or phone and switch to register
        setForm((f) => ({
          ...f,
          email: phoneOrEmail.includes('@') ? phoneOrEmail : '',
          phone: !phoneOrEmail.includes('@') ? phoneOrEmail : '',
        }));
        setStep('register');
      } else {
        setError(err.response?.data?.error || 'Login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await register({
        phone_or_email: phoneOrEmail,
        ...form,
        ntrp_level: parseFloat(form.ntrp_level),
      });
      setPlayer(res.data.player);
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await login(phoneOrEmail);
      if (window.confirm(`Delete account for ${res.data.player.name}? This cannot be undone.`)) {
        await deleteAccount(res.data.player.id);
        alert('Account deleted.');
        setPhoneOrEmail('');
        setStep('login');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Could not find account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h1>Tennis Scheduler</h1>
        <p className="subtitle">Find and organize tennis matches near you</p>

        {error && <div className="alert alert-error">{error}</div>}

        {step === 'login' && (
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>Phone or Email</label>
              <input
                type="text"
                value={phoneOrEmail}
                onChange={(e) => setPhoneOrEmail(e.target.value)}
                placeholder="Enter your phone or email"
                required
              />
            </div>
            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
              {loading ? 'Loading...' : 'Log In / Sign Up'}
            </button>
            <button
              type="button"
              className="btn btn-link btn-block"
              onClick={() => setStep('delete')}
            >
              Delete My Account
            </button>
          </form>
        )}

        {step === 'register' && (
          <form onSubmit={handleRegister}>
            <p className="form-note">Welcome! Complete your profile to get started.</p>
            <div className="form-group">
              <label>Login ID</label>
              <input type="text" value={phoneOrEmail} disabled />
            </div>
            <div className="form-group">
              <label>Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input
                  type="text"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Gender</label>
                <select
                  value={form.gender}
                  onChange={(e) => setForm({ ...form, gender: e.target.value })}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
              <div className="form-group">
                <label>NTRP Level</label>
                <select
                  value={form.ntrp_level}
                  onChange={(e) => setForm({ ...form, ntrp_level: e.target.value })}
                >
                  {[2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0, 5.5, 6.0, 6.5, 7.0].map((v) => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Address</label>
              <input
                type="text"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="Your general area / zip code"
              />
            </div>
            <div className="form-group">
              <label>Notification Preference</label>
              <select
                value={form.notification_preference}
                onChange={(e) => setForm({ ...form, notification_preference: e.target.value })}
              >
                <option value="EmailMe">Email Me</option>
                <option value="TextMe">Text Me</option>
                <option value="DontNotifyMe">Don't Notify Me</option>
              </select>
            </div>
            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
              {loading ? 'Creating...' : 'Create Account'}
            </button>
            <button
              type="button"
              className="btn btn-link btn-block"
              onClick={() => { setStep('login'); setError(''); }}
            >
              Back to Login
            </button>
          </form>
        )}

        {step === 'delete' && (
          <form onSubmit={handleDelete}>
            <p className="form-note">Enter your phone or email to delete your account.</p>
            <div className="form-group">
              <label>Phone or Email</label>
              <input
                type="text"
                value={phoneOrEmail}
                onChange={(e) => setPhoneOrEmail(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-danger btn-block" disabled={loading}>
              {loading ? 'Processing...' : 'Delete Account'}
            </button>
            <button
              type="button"
              className="btn btn-link btn-block"
              onClick={() => { setStep('login'); setError(''); }}
            >
              Back to Login
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
