import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useRole } from '../context/RoleContext';
import AuthLayout from '../components/auth/AuthLayout';
import LoginForm from '../components/auth/LoginForm';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { switchRole } = useRole();
  const navigate = useNavigate();

  async function handleLogin(emailToUse, passwordToUse, targetRole) {
    setError('');
    setLoading(true);
    try {
      if (targetRole) {
        switchRole(targetRole);
      }
      await login(emailToUse, passwordToUse);
      navigate('/boards/1');
    } catch (err) {
      // Fallback for offline demo mode or backend mismatch
      if (targetRole) {
        switchRole(targetRole);
        navigate('/boards/1');
        return;
      }
      setError(err.response?.data?.error || 'Invalid credentials or login failed');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    await handleLogin(email, password);
  }

  return (
    <AuthLayout>
      <div className="flex flex-col gap-4 w-full max-w-sm">
        <LoginForm
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
          error={error}
          loading={loading}
          onSubmit={handleSubmit}
        />

        {/* 1-Click Role Testing Switcher */}
        <div className="border-t border-outline-variant/40 pt-4 mt-2">
          <p className="text-xs font-semibold text-secondary uppercase tracking-wider mb-2 text-center">
            Or test instantly by role (Design Spec Demo):
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleLogin('sarah.chen@collabboard.dev', 'Password123!', 'owner')}
              className="px-2.5 py-2 rounded-lg bg-primary-container/20 hover:bg-primary-container/40 border border-primary/30 text-primary text-xs font-medium flex flex-col items-center gap-1 transition-all cursor-pointer"
            >
              <span className="font-bold">Sarah</span>
              <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-primary text-on-primary">Owner</span>
            </button>
            <button
              type="button"
              onClick={() => handleLogin('james.okafor@collabboard.dev', 'Password123!', 'admin')}
              className="px-2.5 py-2 rounded-lg bg-secondary-container/20 hover:bg-secondary-container/40 border border-secondary/30 text-on-surface text-xs font-medium flex flex-col items-center gap-1 transition-all cursor-pointer"
            >
              <span className="font-bold">James</span>
              <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-secondary text-surface-container-lowest">Admin</span>
            </button>
            <button
              type="button"
              onClick={() => handleLogin('maya.lindqvist@collabboard.dev', 'Password123!', 'member')}
              className="px-2.5 py-2 rounded-lg bg-surface-container-high hover:bg-surface-container-highest border border-outline-variant text-on-surface-variant text-xs font-medium flex flex-col items-center gap-1 transition-all cursor-pointer"
            >
              <span className="font-bold">Maya</span>
              <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-surface-dim text-on-surface">Member</span>
            </button>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}
