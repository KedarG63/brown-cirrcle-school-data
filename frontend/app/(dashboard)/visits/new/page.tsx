'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { visitsApi } from '@/lib/api/visits';
import { schoolsApi } from '@/lib/api/schools';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const visitSchema = z.object({
  schoolId: z.string().min(1, 'Please select a school'),
  visitDate: z.string().min(1, 'Visit date is required'),
  booksNeeded: z.boolean().optional(),
  booksQuantity: z.coerce.number().optional(),
  uniformsNeeded: z.boolean().optional(),
  uniformsQuantity: z.coerce.number().optional(),
  furnitureNeeded: z.boolean().optional(),
  furnitureDetails: z.string().optional(),
  paintingNeeded: z.boolean().optional(),
  paintingArea: z.string().optional(),
  otherCoreRequirements: z.string().optional(),
  tvNeeded: z.boolean().optional(),
  tvQuantity: z.coerce.number().optional(),
  wifiNeeded: z.boolean().optional(),
  wifiDetails: z.string().optional(),
  computersNeeded: z.boolean().optional(),
  computersQuantity: z.coerce.number().optional(),
  otherDevRequirements: z.string().optional(),
  notes: z.string().optional(),
  estimatedBudget: z.coerce.number().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
});

type VisitForm = z.infer<typeof visitSchema>;

function CheckboxField({ label, id, register, watch }: { label: string; id: string; register: any; watch: any }) {
  return (
    <div className="flex items-center gap-3">
      <input type="checkbox" id={id} {...register(id)} className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
      <label htmlFor={id} className="text-sm font-medium text-gray-700">{label}</label>
    </div>
  );
}

export default function NewVisitPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const { data: schools, isLoading: schoolsLoading } = useQuery({
    queryKey: ['schools-all'],
    queryFn: async () => {
      const { data } = await schoolsApi.getAll({ perPage: 100 });
      return data.data?.items || [];
    },
  });

  const { register, handleSubmit, watch, formState: { errors } } = useForm<VisitForm>({
    resolver: zodResolver(visitSchema),
    defaultValues: { priority: 'MEDIUM' },
  });

  const onSubmit = async (formData: VisitForm) => {
    setIsLoading(true);
    try {
      const { schoolId, visitDate, ...reqFields } = formData;
      await visitsApi.create({
        schoolId,
        visitDate,
        requirements: reqFields,
      });
      toast.success('Visit recorded successfully');
      router.push('/dashboard/visits');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create visit');
    } finally {
      setIsLoading(false);
    }
  };

  if (schoolsLoading) return <LoadingSpinner className="mt-20" size="lg" />;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/visits" className="p-2 rounded-lg hover:bg-gray-100">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">New School Visit</h2>
          <p className="text-gray-500">Record a new school assessment visit</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader><CardTitle>Visit Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Select
              id="schoolId"
              label="School *"
              options={(schools || []).map((s: any) => ({ value: s.id, label: `${s.name} - ${s.location}` }))}
              error={errors.schoolId?.message}
              {...register('schoolId')}
            />
            <Input id="visitDate" label="Visit Date *" type="date" error={errors.visitDate?.message} {...register('visitDate')} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Core Requirements</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <CheckboxField label="School Books Needed" id="booksNeeded" register={register} watch={watch} />
              {watch('booksNeeded') && <Input id="booksQuantity" type="number" placeholder="Quantity" className="ml-7 max-w-xs" {...register('booksQuantity')} />}
            </div>
            <div className="space-y-3">
              <CheckboxField label="Uniforms Needed" id="uniformsNeeded" register={register} watch={watch} />
              {watch('uniformsNeeded') && <Input id="uniformsQuantity" type="number" placeholder="Quantity" className="ml-7 max-w-xs" {...register('uniformsQuantity')} />}
            </div>
            <div className="space-y-3">
              <CheckboxField label="Furniture Needed" id="furnitureNeeded" register={register} watch={watch} />
              {watch('furnitureNeeded') && <Textarea id="furnitureDetails" placeholder="Describe furniture needs..." className="ml-7" {...register('furnitureDetails')} />}
            </div>
            <div className="space-y-3">
              <CheckboxField label="Wall Painting Needed" id="paintingNeeded" register={register} watch={watch} />
              {watch('paintingNeeded') && <Input id="paintingArea" placeholder="Describe area details" className="ml-7" {...register('paintingArea')} />}
            </div>
            <Textarea id="otherCoreRequirements" label="Other Core Needs" placeholder="Any other requirements..." {...register('otherCoreRequirements')} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Development Requirements</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <CheckboxField label="TV/Display Needed" id="tvNeeded" register={register} watch={watch} />
              {watch('tvNeeded') && <Input id="tvQuantity" type="number" placeholder="Quantity" className="ml-7 max-w-xs" {...register('tvQuantity')} />}
            </div>
            <div className="space-y-3">
              <CheckboxField label="WiFi Connectivity Needed" id="wifiNeeded" register={register} watch={watch} />
              {watch('wifiNeeded') && <Input id="wifiDetails" placeholder="Describe requirements" className="ml-7" {...register('wifiDetails')} />}
            </div>
            <div className="space-y-3">
              <CheckboxField label="Computers/Tablets Needed" id="computersNeeded" register={register} watch={watch} />
              {watch('computersNeeded') && <Input id="computersQuantity" type="number" placeholder="Quantity" className="ml-7 max-w-xs" {...register('computersQuantity')} />}
            </div>
            <Textarea id="otherDevRequirements" label="Other Development Needs" placeholder="Any other development requirements..." {...register('otherDevRequirements')} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Additional Information</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Textarea id="notes" label="Notes / Observations" placeholder="Additional observations about the school..." {...register('notes')} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input id="estimatedBudget" label="Estimated Budget (INR)" type="number" placeholder="0" {...register('estimatedBudget')} />
              <Select
                id="priority"
                label="Priority Level"
                options={[
                  { value: 'LOW', label: 'Low' },
                  { value: 'MEDIUM', label: 'Medium' },
                  { value: 'HIGH', label: 'High' },
                  { value: 'URGENT', label: 'Urgent' },
                ]}
                {...register('priority')}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button type="submit" size="lg" isLoading={isLoading}>Submit Visit</Button>
          <Link href="/dashboard/visits">
            <Button type="button" variant="outline" size="lg">Cancel</Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
