import React from 'react';
import { Navigate } from 'react-router-dom';

interface Props {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<Props> = ({ children }) => {
  const token = localStorage.getItem('access_token');
  const role = localStorage.getItem("role");

  if (!token) {
    return <Navigate to="/login" replace />;
  }
  if (role !== "employee") {
      return <Navigate to="/login" replace />;
    }
  return <>{children}</>;
};

export default ProtectedRoute;
