'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { schoolsApi } from '@/lib/api/schools';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { formatDate, getStatusColor } from '@/lib/utils';
import { ArrowLeft, MapPin, Phone, User } from 'lucide-react';

export default function SchoolDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const { data: school, isLoading } = useQuery({
    queryKey: ['school', id],
    queryFn: async () => {
      const { data } = await schoolsApi.getById(id);
      return data.data;
    },
  });

  if (isLoading) return <LoadingSpinner className="mt-20" size="lg" />;
  if (!school) return <div className="text-center mt-20 text-gray-400">School not found</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/schools" className="p-2 rounded-lg hover:bg-gray-100">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{school.name}</h2>
          <p className="text-gray-500">{school.location}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle>School Details</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-gray-400" /><span>{school.address || school.location}</span></div>
            {school.contactPerson && <div className="flex items-center gap-2"><User className="h-4 w-4 text-gray-400" /><span>{school.contactPerson}</span></div>}
            {school.contactPhone && <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-gray-400" /><span>{school.contactPhone}</span></div>}
            {school.district && <p><span className="text-gray-400">District:</span> {school.district}</p>}
            {school.state && <p><span className="text-gray-400">State:</span> {school.state}</p>}
            {school.pincode && <p><span className="text-gray-400">PIN:</span> {school.pincode}</p>}
            <p className="text-gray-400 text-xs">Registered {formatDate(school.createdAt)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Visit History</CardTitle></CardHeader>
          <CardContent>
            {school.visits && school.visits.length > 0 ? (
              <div className="space-y-2">
                {school.visits.map((visit: any) => (
                  <Link key={visit.id} href={`/dashboard/visits/${visit.id}`} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 border border-gray-100">
                    <div>
                      <p className="text-sm font-medium">{visit.employee?.name}</p>
                      <p className="text-xs text-gray-500">{formatDate(visit.visitDate)}</p>
                    </div>
                    <Badge className={getStatusColor(visit.status)}>{visit.status}</Badge>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-400 py-4">No visits recorded</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
