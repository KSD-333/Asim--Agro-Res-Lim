import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string; // e.g., 'admin'
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);

  useEffect(() => {
    if (!user) {
      setHasAccess(false);
      return;
    }
    if (!requiredRole) {
      setHasAccess(true);
      return;
    }
    // Check user role in Firestore
    const checkRole = async () => {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const data = userDoc.data();
      setHasAccess(data?.role === requiredRole);
    };
    checkRole();
  }, [user, requiredRole]);

  if (loading || hasAccess === null) {
    return <LoadingSpinner />;
  }

  if (!user || !hasAccess) {
    // Save the current location to redirect back after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute; 