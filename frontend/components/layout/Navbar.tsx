'use client';

import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LogOut, User, Menu } from 'lucide-react';

interface NavbarProps {
  onMenuToggle: () => void;
}

export function Navbar({ onMenuToggle }: NavbarProps) {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="p-2 rounded-lg hover:bg-gray-100 lg:hidden"
        >
          <Menu className="h-5 w-5 text-gray-600" />
        </button>
        <h1 className="text-base sm:text-lg font-semibold text-gray-900">
          {user?.role === 'ADMIN' ? 'Admin Panel' : 'Employee Portal'}
        </h1>
      </div>
      <div className="flex items-center gap-2 sm:gap-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
            <User className="h-4 w-4 text-primary-600" />
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-gray-900">{user?.name}</p>
            <Badge variant={user?.role === 'ADMIN' ? 'info' : 'default'} className="text-[10px]">
              {user?.role}
            </Badge>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={handleLogout}>
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
