'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { analyticsApi } from '@/lib/api/analytics';
import { visitsApi } from '@/lib/api/visits';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { formatDate, getStatusColor } from '@/lib/utils';
import { School, ClipboardList, Users, Clock, TrendingUp, Calendar } from 'lucide-react';
import Link from 'next/link';

function StatCard({ title, value, icon: Icon, color }: { title: string; value: number | string; icon: any; color: string }) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
          </div>
          <div className={`h-12 w-12 rounded-xl ${color} flex items-center justify-center`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function AdminDashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const { data } = await analyticsApi.getDashboard();
      return data.data;
    },
  });

  const { data: performance, isLoading: perfLoading } = useQuery({
    queryKey: ['employee-performance'],
    queryFn: async () => {
      const { data } = await analyticsApi.getEmployeePerformance();
      return data.data;
    },
  });

  if (statsLoading) return <LoadingSpinner className="mt-20" size="lg" />;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <p className="text-gray-500">Overview of school assessment activities</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Schools" value={stats?.totalSchools || 0} icon={School} color="bg-blue-500" />
        <StatCard title="Total Visits" value={stats?.totalVisits || 0} icon={ClipboardList} color="bg-green-500" />
        <StatCard title="Active Employees" value={stats?.activeEmployees || 0} icon={Users} color="bg-purple-500" />
        <StatCard title="Visits Today" value={stats?.visitsToday || 0} icon={Calendar} color="bg-orange-500" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6 text-center">
            <Clock className="h-8 w-8 text-blue-500 mx-auto" />
            <p className="text-2xl font-bold mt-2">{stats?.visitsThisWeek || 0}</p>
            <p className="text-sm text-gray-500">This Week</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <TrendingUp className="h-8 w-8 text-green-500 mx-auto" />
            <p className="text-2xl font-bold mt-2">{stats?.visitsThisMonth || 0}</p>
            <p className="text-sm text-gray-500">This Month</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <ClipboardList className="h-8 w-8 text-yellow-500 mx-auto" />
            <p className="text-2xl font-bold mt-2">{stats?.pendingReviews || 0}</p>
            <p className="text-sm text-gray-500">Pending Reviews</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Employee Performance</CardTitle>
        </CardHeader>
        <CardContent>
          {perfLoading ? (
            <LoadingSpinner />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Employee</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Total Visits</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">This Month</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Today</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Last Visit</th>
                  </tr>
                </thead>
                <tbody>
                  {performance?.map((emp: any) => (
                    <tr key={emp.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{emp.name}</td>
                      <td className="py-3 px-4">{emp.totalVisits}</td>
                      <td className="py-3 px-4">{emp.visitsThisMonth}</td>
                      <td className="py-3 px-4">{emp.visitsToday}</td>
                      <td className="py-3 px-4 text-gray-500">{emp.lastVisitDate ? formatDate(emp.lastVisitDate) : 'N/A'}</td>
                    </tr>
                  ))}
                  {(!performance || performance.length === 0) && (
                    <tr><td colSpan={5} className="py-8 text-center text-gray-400">No employee data</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function EmployeeDashboard() {
  const { data: visitsData, isLoading } = useQuery({
    queryKey: ['my-visits'],
    queryFn: async () => {
      const { data } = await visitsApi.getAll({ perPage: 5 });
      return data.data;
    },
  });

  if (isLoading) return <LoadingSpinner className="mt-20" size="lg" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My Dashboard</h2>
          <p className="text-gray-500">Your recent activity and quick actions</p>
        </div>
        <Link href="/dashboard/visits/new" className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700">
          + New Visit
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard title="My Total Visits" value={visitsData?.pagination?.total || 0} icon={ClipboardList} color="bg-blue-500" />
        <Link href="/dashboard/schools">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-green-500 flex items-center justify-center">
                <School className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="font-medium">View Schools</p>
                <p className="text-sm text-gray-500">Browse & add schools</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/dashboard/visits/new">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-purple-500 flex items-center justify-center">
                <ClipboardList className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="font-medium">New Visit</p>
                <p className="text-sm text-gray-500">Record a school visit</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Visits</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {visitsData?.items?.map((visit: any) => (
              <Link key={visit.id} href={`/dashboard/visits/${visit.id}`} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 border border-gray-100">
                <div>
                  <p className="font-medium">{visit.school?.name}</p>
                  <p className="text-sm text-gray-500">{visit.school?.location} &middot; {formatDate(visit.visitDate)}</p>
                </div>
                <Badge className={getStatusColor(visit.status)}>{visit.status}</Badge>
              </Link>
            ))}
            {(!visitsData?.items || visitsData.items.length === 0) && (
              <p className="text-center text-gray-400 py-8">No visits yet. Create your first visit!</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  return user?.role === 'ADMIN' ? <AdminDashboard /> : <EmployeeDashboard />;
}
