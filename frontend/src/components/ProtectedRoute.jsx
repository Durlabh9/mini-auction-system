import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

function ProtectedRoute() {
  const { user } = useContext(AuthContext);

  if (!user) {
    return <Navigate to="/login" />;
  }


  return <Outlet />;
}

export default ProtectedRoute;