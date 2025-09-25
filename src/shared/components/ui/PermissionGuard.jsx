import React from 'react';

const PermissionGuard = ({ children, show = true, fallback = null }) => {
  if (!show) return null;
  return children ?? fallback;
};

export default PermissionGuard;
