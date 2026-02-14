'use client';

import { useState } from 'react';
import { ProtectedRoute } from '@/components/shared/ProtectedRoute';
import { Sidebar } from '@/components/layout/Sidebar';
import { Navbar } from '@/components/layout/Navbar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="lg:ml-64">
          <Navbar onMenuToggle={() => setSidebarOpen(true)} />
          <main className="p-4 sm:p-6">{children}</main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
