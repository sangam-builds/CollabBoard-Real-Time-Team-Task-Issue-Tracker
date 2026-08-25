import React, { useState } from 'react';
import InputField from '../../common/InputField';
import Checkbox from '../../common/Checkbox';
import Button from '../../common/Button';
import ErrorMessage from '../../common/ErrorMessage';

export default function LoginForm({
  email,
  setEmail,
  password,
  setPassword,
  error,
  loading = false,
  onSubmit,
}) {
  const [rememberMe, setRememberMe] = useState(false);

  return (
    <div className="w-full max-w-sm flex flex-col gap-lg mt-xl md:mt-0">
      <div className="flex flex-col gap-xs">
        <h2 className="font-section-headline text-section-headline text-on-surface">
          Sign In
        </h2>
        <p className="font-body-default text-body-default text-on-surface-variant">
          Access your workspace and dependencies.
        </p>
      </div>

      <form onSubmit={onSubmit} className="flex flex-col gap-md">
        {error && <ErrorMessage message={error} />}

        {/* Email Field */}
        <InputField
          id="email"
          name="email"
          label="Email Address"
          type="email"
          placeholder="name@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        {/* Password Field */}
        <InputField
          id="password"
          name="password"
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          rightLink={
            <a href="#" className="font-label-mono text-label-mono text-primary hover:underline">
              Forgot?
            </a>
          }
        />

        {/* Stay signed in checkbox */}
        <Checkbox
          id="remember"
          checked={rememberMe}
          onChange={(e) => setRememberMe(e.target.checked)}
          label="Stay signed in for 30 days"
        />

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={loading}
          variant="primary"
          className="mt-xs"
        >
          {loading ? 'Signing in...' : 'Sign in'}
        </Button>
      </form>

      {/* Footer link */}
      <p className="font-body-default text-body-default text-center text-on-surface-variant mt-sm">
        Don't have an account?{' '}
        <a href="#" className="text-primary hover:underline font-medium">
          Request access
        </a>
      </p>
    </div>
  );
}
