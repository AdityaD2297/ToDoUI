import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../store';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, token, isLoading } = useAppSelector((state) => state.auth);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user && !token) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};
