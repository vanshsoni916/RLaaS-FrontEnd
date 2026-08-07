import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerClient, loginClient, resendVerification } from '../api/client';
import toast from 'react-hot-toast';

export default function Landing() {
  const [tab, setTab] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [unverified, setUnverified] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState('');
  const navigate = useNavigate();

  const saveAndRedirect = (client) => {
    localStorage.setItem('api_key', client.api_key);
    localStorage.setItem('client_name', client.name);
    localStorage.setItem('client_id', client.id);
    navigate('/dashboard');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await loginClient(email);
      toast.success(`Welcome back, ${data.client.name}!`);
      saveAndRedirect(data.client);
    } catch (err) {
      const status = err.response?.status;
      const msg = err.response?.data?.message || 'Login failed';

      // Email not verified
      if (status === 403) {
        setUnverified(true);
        setUnverifiedEmail(email);
      } else {
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await registerClient(name, email);
      if (data.email_sent) {
        toast.success('Account created! Check your email to verify.');
      } else {
        // Account created but email failed to send
        toast.error('Account created, but verification email failed to send. Try resending.');
      }
      setUnverified(true);
      setUnverifiedEmail(email);
      setTab('login');
    } catch (err) {
      const msg = err.response?.data?.errors?.email?.[0]
        || err.response?.data?.message
        || 'Registration failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await resendVerification(unverifiedEmail);
      toast.success('Verification email resent!');
    } catch (err) {
      toast.error('Failed to resend. Try again.');
    }
  };

  if (unverified) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-900 to-slate-800 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-2xl p-10 max-w-md w-full text-center">
          <div className="text-5xl mb-4">📧</div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">
            Check your email
          </h2>
          <p className="text-slate-500 text-sm mb-2">
            We sent a verification link to:
          </p>
          <p className="font-mono text-indigo-600 text-sm bg-indigo-50 px-4 py-2 rounded-lg mb-6">
            {unverifiedEmail}
          </p>
          <p className="text-slate-400 text-xs mb-6">
            Click the link in the email to verify your account.
            Check your spam folder if you don't see it.
          </p>
          <button
            onClick={handleResend}
            className="w-full border border-slate-200 text-slate-600 py-3 rounded-lg hover:bg-slate-50 transition text-sm mb-3"
          >
            Resend Verification Email
          </button>
          <button
            onClick={() => setUnverified(false)}
            className="w-full text-slate-400 text-sm hover:text-slate-600 transition"
          >
            ← Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 to-slate-800 flex items-center justify-center p-6">
      <div className="w-full max-w-md">

        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-3">⚡ RLaaS</h1>
          <p className="text-slate-400 text-sm">
            Rate Limiter as a Service — Token Bucket · Sliding Window · Webhooks
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-8">
          {[
            '🚀 Token Bucket',
            '📊 Sliding Window',
            '📈 Real-time Analytics',
            '🔔 Webhook Alerts',
          ].map((f) => (
            <div key={f} className="bg-slate-700 text-slate-300 text-sm text-center py-2 px-3 rounded-lg">
              {f}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">

          {/* Tab Switcher */}
          <div className="flex bg-slate-100 rounded-xl p-1 mb-6">
            {['login', 'register'].map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition capitalize ${tab === t
                    ? 'bg-white text-slate-800 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                  }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* LOGIN */}
          {tab === 'login' && (
            <form onSubmit={handleLogin} className="flex flex-col gap-4">
              <div>
                <label className="text-slate-600 text-sm font-medium block mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-indigo-400 transition"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-3 rounded-lg transition disabled:opacity-60"
              >
                {loading ? 'Logging in...' : 'Login →'}
              </button>
              <p className="text-center text-slate-400 text-xs">
                Don't have an account?{' '}
                <span
                  onClick={() => setTab('register')}
                  className="text-indigo-500 cursor-pointer hover:underline"
                >
                  Register here
                </span>
              </p>
            </form>
          )}

          {/* REGISTER */}
          {tab === 'register' && (
            <form onSubmit={handleRegister} className="flex flex-col gap-4">
              <div>
                <label className="text-slate-600 text-sm font-medium block mb-1">
                  Company or App Name
                </label>
                <input
                  type="text"
                  placeholder="My Awesome App"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-indigo-400 transition"
                />
              </div>
              <div>
                <label className="text-slate-600 text-sm font-medium block mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-indigo-400 transition"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-3 rounded-lg transition disabled:opacity-60"
              >
                {loading ? 'Creating account...' : 'Create Account →'}
              </button>
              <p className="text-center text-slate-400 text-xs">
                Already have an account?{' '}
                <span
                  onClick={() => setTab('login')}
                  className="text-indigo-500 cursor-pointer hover:underline"
                >
                  Login here
                </span>
              </p>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}