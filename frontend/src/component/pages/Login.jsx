import { useState } from 'react';
import { auth } from '/src/utils/api';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [form, setForm] = useState({ email:'', password:'' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

// src/component/pages/Login.jsx
function onChange(e) {
  setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  if (error) setError('');
}

  async function onSubmit(e) {
    e.preventDefault();
    if(!form.email || !form.password) return setError('Complete both fields');
    setLoading(true);
    try {
      const res = await auth.login({ email: form.email, password: form.password });
      setLoading(false);
      if(res?.token) {
        localStorage.setItem('token', res.token);
        localStorage.setItem('user', JSON.stringify(res.user));
        // Redirect berdasarkan role
        if (res.user.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/');
        }
      } else {
        setError(res?.message || 'Login failed');
      }
    } catch (err) {
      setLoading(false);
      setError(err.message || 'Login failed');
    }
  }

  function onGoogle() {
    window.location.href = auth.googleUrl();
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Login</h2>
      <form onSubmit={onSubmit} className="space-y-3">
        <input name="email" placeholder="Email" value={form.email} onChange={onChange} className="w-full p-2 border" />
        <div className="relative">
          <input name="password" type={showPassword ? 'text' : 'password'} placeholder="Password" value={form.password} onChange={onChange} className="w-full p-2 border pr-10" />
          <button type="button" onClick={()=>setShowPassword(s=>!s)} className="absolute right-2 top-2 text-sm">{showPassword ? 'Hide' : 'Show'}</button>
        </div>
        {error && <div className="text-red-600">{error}</div>}
        <button type="submit" disabled={loading} className="w-full py-2 bg-blue-600 text-white rounded">{loading ? 'Logging...' : 'Login'}</button>
      </form>
      <div className="mt-4">
        <div className="text-center mb-2 text-sm">Or login with</div>
        <div className="flex gap-2">
          <button onClick={onGoogle} className="flex-1 py-2 border rounded">Google</button>
        </div>
        <div className="text-sm mt-3">Don't have an account? <button onClick={()=>navigate('/register')} className="text-blue-600 underline">Create account</button></div>
      </div>
    </div>
  );
}
