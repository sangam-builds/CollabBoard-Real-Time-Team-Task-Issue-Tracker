import React from 'react';
import Button from '../../common/Button';

export default function GoogleLoginButton({ onClick }) {
  return (
    <Button
      type="button"
      variant="outline"
      onClick={onClick}
      className="gap-sm"
    >
      <span className="material-symbols-outlined text-[18px]">login</span>
      Continue with Google
    </Button>
  );
}
