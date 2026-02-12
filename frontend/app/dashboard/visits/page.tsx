'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { visitsApi } from '@/lib/api/visits';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { formatDate, getStatusColor, getPriorityColor } from '@/lib/utils';
import { Plus, Search, Image } from 'lucide-react';

export default function VisitsPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['visits', page, status],
    queryFn: async () => {
      const params: any = { page, perPage: 10 };
      if (status) params.status = status;
      const { data } = await visitsApi.getAll(params);
      return data.data;
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Visits</h2>
          <p className="text-gray-500">School visit records</p>
        </div>
        <Link href="/dashboard/visits/new">
          <Button><Plus className="h-4 w-4 mr-2" />New Visit</Button>
        </Link>
      </div>

      <div className="flex gap-2">
        {['', 'PENDING', 'IN_PROGRESS', 'COMPLETED', 'REVIEWED'].map((s) => (
          <button
            key={s}
            onClick={() => { setStatus(s); setPage(1); }}
            className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
              status === s
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {s || 'All'}
          </button>
        ))}
      </div>

      {isLoading ? (
        <LoadingSpinner className="mt-10" size="lg" />
      ) : (
        <>
          <div className="space-y-3">
            {data?.items?.map((visit: any) => (
              <Link key={visit.id} href={`/dashboard/visits/${visit.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold">{visit.school?.name}</h3>
                        <Badge className={getStatusColor(visit.status)}>{visit.status}</Badge>
                        {visit.requirements?.priority && (
                          <Badge className={getPriorityColor(visit.requirements.priority)}>{visit.requirements.priority}</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        {visit.school?.location} &middot; {visit.employee?.name} &middot; {formatDate(visit.visitDate)}
                      </p>
                    </div>
                    {visit._count?.images > 0 && (
                      <div className="flex items-center gap-1 text-sm text-gray-400">
                        <Image className="h-4 w-4" />{visit._count.images}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
          {(!data?.items || data.items.length === 0) && (
            <div className="text-center py-12 text-gray-400">No visits found</div>
          )}
          {data?.pagination && data.pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</Button>
              <span className="text-sm text-gray-500">Page {page} of {data.pagination.totalPages}</span>
              <Button variant="outline" size="sm" disabled={page >= data.pagination.totalPages} onClick={() => setPage(page + 1)}>Next</Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
