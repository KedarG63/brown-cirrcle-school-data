'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { visitsApi } from '@/lib/api/visits';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { formatDateTime, getStatusColor, getPriorityColor } from '@/lib/utils';
import { ArrowLeft, CheckCircle, XCircle, MapPin, User, Calendar } from 'lucide-react';

function ReqItem({ label, needed, detail }: { label: string; needed: boolean; detail?: string | number | null }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
      <div className="flex items-center gap-2">
        {needed ? <CheckCircle className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-gray-300" />}
        <span className={needed ? 'font-medium' : 'text-gray-400'}>{label}</span>
      </div>
      {detail && <span className="text-sm text-gray-600">{detail}</span>}
    </div>
  );
}

export default function VisitDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const { data: visit, isLoading } = useQuery({
    queryKey: ['visit', id],
    queryFn: async () => {
      const { data } = await visitsApi.getById(id);
      return data.data;
    },
  });

  if (isLoading) return <LoadingSpinner className="mt-20" size="lg" />;
  if (!visit) return <div className="text-center mt-20 text-gray-400">Visit not found</div>;

  const req = visit.requirements;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/visits" className="p-2 rounded-lg hover:bg-gray-100">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-gray-900">{visit.school?.name || 'Visit'}</h2>
            <Badge className={getStatusColor(visit.status)}>{visit.status}</Badge>
            {req?.priority && <Badge className={getPriorityColor(req.priority)}>{req.priority}</Badge>}
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
            {visit.school && <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{visit.school.location || visit.school.address}</span>}
            <span className="flex items-center gap-1"><User className="h-3.5 w-3.5" />{visit.employee?.name}</span>
            <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{formatDateTime(visit.visitDate)}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Core Requirements</CardTitle></CardHeader>
          <CardContent className="space-y-1">
            {req ? (
              <>
                <ReqItem label="School Books" needed={req.booksNeeded} detail={req.booksQuantity ? `Qty: ${req.booksQuantity}` : undefined} />
                <ReqItem label="Uniforms" needed={req.uniformsNeeded} detail={req.uniformsQuantity ? `Qty: ${req.uniformsQuantity}` : undefined} />
                <ReqItem label="Furniture" needed={req.furnitureNeeded} detail={req.furnitureDetails} />
                <ReqItem label="Wall Painting" needed={req.paintingNeeded} detail={req.paintingArea} />
                {req.otherCoreRequirements && <p className="text-sm text-gray-600 mt-2 p-2 bg-gray-50 rounded">{req.otherCoreRequirements}</p>}
              </>
            ) : (
              <p className="text-gray-400 text-sm">No requirements recorded</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Development Requirements</CardTitle></CardHeader>
          <CardContent className="space-y-1">
            {req ? (
              <>
                <ReqItem label="TV/Display" needed={req.tvNeeded} detail={req.tvQuantity ? `Qty: ${req.tvQuantity}` : undefined} />
                <ReqItem label="WiFi Connectivity" needed={req.wifiNeeded} detail={req.wifiDetails} />
                <ReqItem label="Computers/Tablets" needed={req.computersNeeded} detail={req.computersQuantity ? `Qty: ${req.computersQuantity}` : undefined} />
                {req.otherDevRequirements && <p className="text-sm text-gray-600 mt-2 p-2 bg-gray-50 rounded">{req.otherDevRequirements}</p>}
              </>
            ) : (
              <p className="text-gray-400 text-sm">No requirements recorded</p>
            )}
          </CardContent>
        </Card>
      </div>

      {req?.notes && (
        <Card>
          <CardHeader><CardTitle>Notes & Observations</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{req.notes}</p>
            {req.estimatedBudget && <p className="mt-3 text-sm font-medium">Estimated Budget: ₹{req.estimatedBudget.toLocaleString('en-IN')}</p>}
          </CardContent>
        </Card>
      )}

      {visit.images && visit.images.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Photos ({visit.images.length})</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {visit.images.map((img: any) => (
                <div key={img.id} className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                  <img src={img.imageUrl} alt={img.description || 'Visit photo'} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
