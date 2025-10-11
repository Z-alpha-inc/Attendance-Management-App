import React from 'react';
import { Navigate } from 'react-router-dom';

interface Props {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<Props> = ({ children }) => {
  const token = localStorage.getItem('access_token');

  if (!token) {
    // トークンがなければログインページにリダイレクト
    return <Navigate to="/login" replace />;
  }

  // トークンがあればそのまま表示
  return <>{children}</>;
};

export default ProtectedRoute;
