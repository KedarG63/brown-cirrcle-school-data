'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { schoolsApi } from '@/lib/api/schools';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { formatDate } from '@/lib/utils';
import { Plus, Search, MapPin, Phone } from 'lucide-react';

export default function SchoolsPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['schools', page, search],
    queryFn: async () => {
      const { data } = await schoolsApi.getAll({ page, perPage: 10, search: search || undefined });
      return data.data;
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Schools</h2>
          <p className="text-gray-500">Manage registered schools</p>
        </div>
        <Link href="/dashboard/schools/new">
          <Button><Plus className="h-4 w-4 mr-2" />Add School</Button>
        </Link>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search schools..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="w-full rounded-lg border border-gray-300 pl-10 pr-4 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
        />
      </div>

      {isLoading ? (
        <LoadingSpinner className="mt-10" size="lg" />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data?.items?.map((school: any) => (
              <Link key={school.id} href={`/dashboard/schools/${school.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                  <CardContent className="p-5">
                    <h3 className="font-semibold text-gray-900">{school.name}</h3>
                    <div className="mt-2 space-y-1 text-sm text-gray-500">
                      <div className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{school.location}</div>
                      {school.contactPerson && <div className="flex items-center gap-1"><Phone className="h-3.5 w-3.5" />{school.contactPerson}</div>}
                      {school.district && <p>{school.district}{school.state ? `, ${school.state}` : ''}</p>}
                    </div>
                    <p className="mt-3 text-xs text-gray-400">Added {formatDate(school.createdAt)}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
          {(!data?.items || data.items.length === 0) && (
            <div className="text-center py-12 text-gray-400">No schools found</div>
          )}
          {data?.pagination && data.pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-4">
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
