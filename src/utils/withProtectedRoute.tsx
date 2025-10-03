/**
 * Higher-order component for protecting components
 * Alternative way to use protection without wrapping in JSX
 */

import React from 'react';
import ProtectedRoute from '../components/ProtectedRoute';

export const withProtectedRoute = <P extends object>(
  Component: React.ComponentType<P>,
  requiredPermission?: keyof import('../types/blog').AdminUser['permissions']
) => {
  const WrappedComponent: React.FC<P> = (props) => {
    return (
      <ProtectedRoute requiredPermission={requiredPermission}>
        <Component {...props} />
      </ProtectedRoute>
    );
  };

  // Set display name for debugging
  WrappedComponent.displayName = `withProtectedRoute(${Component.displayName || Component.name})`;

  return WrappedComponent;
};

export default withProtectedRoute;