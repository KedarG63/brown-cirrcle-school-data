'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';
import {
  LayoutDashboard,
  School,
  ClipboardList,
  Users,
  BarChart3,
  BookOpen,
  StickyNote,
  MessageSquare,
  X,
} from 'lucide-react';

const employeeNav = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Schools', href: '/dashboard/schools', icon: School },
  { name: 'Visits', href: '/dashboard/visits', icon: ClipboardList },
  { name: 'Notes', href: '/dashboard/notes', icon: StickyNote },
  { name: 'Chat', href: '/dashboard/chat', icon: MessageSquare },
];

const adminNav = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Schools', href: '/dashboard/schools', icon: School },
  { name: 'Visits', href: '/dashboard/visits', icon: ClipboardList },
  { name: 'Notes', href: '/dashboard/notes', icon: StickyNote },
  { name: 'Chat', href: '/dashboard/chat', icon: MessageSquare },
  { name: 'Employees', href: '/dashboard/admin/employees', icon: Users },
  { name: 'Analytics', href: '/dashboard/admin/analytics', icon: BarChart3 },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useAuthStore();

  const navItems = user?.role === 'ADMIN' ? adminNav : employeeNav;

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          'fixed left-0 top-0 z-50 h-screen w-64 border-r border-gray-200 bg-white transition-transform duration-300 ease-in-out',
          'lg:translate-x-0 lg:z-40',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-gray-200 px-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
              <BookOpen className="h-4 w-4 text-primary-600" />
            </div>
            <span className="text-lg font-bold text-gray-900">SchoolAssess</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 lg:hidden"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>
        <nav className="space-y-1 p-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
