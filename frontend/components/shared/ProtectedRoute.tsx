'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { authApi } from '@/lib/api/auth';
import { LoadingSpinner } from './LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'ADMIN' | 'EMPLOYEE';
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, setUser, setLoading, logout } = useAuthStore();

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        logout();
        router.replace('/login');
        return;
      }

      if (!user) {
        try {
          const { data } = await authApi.getMe();
          if (data.success && data.data) {
            setUser(data.data);
          } else {
            logout();
            router.replace('/login');
          }
        } catch {
          logout();
          router.replace('/login');
        }
      }

      setLoading(false);
    };

    checkAuth();
  }, [user, router, setUser, setLoading, logout]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  if (requiredRole && user?.role !== requiredRole) {
    router.replace('/dashboard');
    return null;
  }

  return <>{children}</>;
}
