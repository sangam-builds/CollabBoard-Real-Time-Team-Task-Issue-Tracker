import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';

export default function LogoutButton({
  className = '',
  variant = 'outline',
  showIcon = true,
  children = 'Log out',
  onLogoutSuccess,
  ...props
}) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    if (loading) return;
    setLoading(true);
    try {
      await logout();
      if (onLogoutSuccess) {
        onLogoutSuccess();
      } else {
        navigate('/login', { replace: true });
      }
    } catch (err) {
      console.error('Logout error:', err);
      navigate('/login', { replace: true });
    } finally {
      setLoading(false);
    }
  }

  const baseStyles =
    'inline-flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium font-label-mono transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    outline:
      'border border-outline-variant text-on-surface hover:bg-error-container hover:text-on-error-container hover:border-error',
    ghost:
      'text-on-surface-variant hover:text-error hover:bg-error-container/30',
    primary:
      'bg-error text-on-error hover:bg-error/90 shadow-sm',
  };

  const variantStyle = variants[variant] || variants.outline;

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      className={`${baseStyles} ${variantStyle} ${className}`}
      title="Sign out of your account"
      {...props}
    >
      {showIcon && (
        <span className="material-symbols-outlined text-[16px]">
          {loading ? 'hourglass_top' : 'logout'}
        </span>
      )}
      <span>{loading ? 'Logging out...' : children}</span>
    </button>
  );
}
