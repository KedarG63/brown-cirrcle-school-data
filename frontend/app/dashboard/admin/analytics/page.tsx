'use client';

import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '@/lib/api/analytics';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { BarChart3, BookOpen, Monitor, Shirt, Paintbrush, Wifi, Armchair, Tv } from 'lucide-react';

export default function AnalyticsPage() {
  const { data: requirements, isLoading } = useQuery({
    queryKey: ['requirements-aggregation'],
    queryFn: async () => {
      const { data } = await analyticsApi.getRequirements();
      return data.data;
    },
  });

  if (isLoading) return <LoadingSpinner className="mt-20" size="lg" />;

  const reqCards = [
    { label: 'Books', needed: requirements?.books?.needed || 0, quantity: requirements?.books?.totalQuantity, icon: BookOpen, color: 'bg-blue-500' },
    { label: 'Uniforms', needed: requirements?.uniforms?.needed || 0, quantity: requirements?.uniforms?.totalQuantity, icon: Shirt, color: 'bg-green-500' },
    { label: 'Furniture', needed: requirements?.furniture?.needed || 0, icon: Armchair, color: 'bg-yellow-500' },
    { label: 'Painting', needed: requirements?.painting?.needed || 0, icon: Paintbrush, color: 'bg-pink-500' },
    { label: 'TV/Display', needed: requirements?.tv?.needed || 0, quantity: requirements?.tv?.totalQuantity, icon: Tv, color: 'bg-purple-500' },
    { label: 'WiFi', needed: requirements?.wifi?.needed || 0, icon: Wifi, color: 'bg-indigo-500' },
    { label: 'Computers', needed: requirements?.computers?.needed || 0, quantity: requirements?.computers?.totalQuantity, icon: Monitor, color: 'bg-red-500' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Analytics</h2>
        <p className="text-gray-500">Requirements aggregation across all schools</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {reqCards.map((item) => (
          <Card key={item.label}>
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-lg ${item.color} flex items-center justify-center`}>
                  <item.icon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">{item.label}</p>
                  <p className="text-xl font-bold">{item.needed} schools</p>
                  {item.quantity !== undefined && (
                    <p className="text-xs text-gray-400">Total qty: {item.quantity}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
