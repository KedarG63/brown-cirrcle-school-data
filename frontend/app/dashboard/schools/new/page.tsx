'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { schoolsApi } from '@/lib/api/schools';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const schoolSchema = z.object({
  name: z.string().min(1, 'School name is required'),
  location: z.string().min(1, 'Location is required'),
  address: z.string().optional(),
  contactPerson: z.string().optional(),
  contactPhone: z.string().optional(),
  district: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().optional(),
});

type SchoolForm = z.infer<typeof schoolSchema>;

export default function NewSchoolPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SchoolForm>({
    resolver: zodResolver(schoolSchema),
  });

  const onSubmit = async (formData: SchoolForm) => {
    setIsLoading(true);
    try {
      await schoolsApi.create(formData);
      toast.success('School added successfully');
      router.push('/dashboard/schools');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to add school');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/schools" className="p-2 rounded-lg hover:bg-gray-100">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Add New School</h2>
          <p className="text-gray-500">Register a new school or education center</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input id="name" label="School Name *" placeholder="Enter school name" error={errors.name?.message} {...register('name')} />
              <Input id="location" label="Location *" placeholder="Village/City" error={errors.location?.message} {...register('location')} />
            </div>
            <Input id="address" label="Full Address" placeholder="Street address" {...register('address')} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input id="contactPerson" label="Contact Person" placeholder="Principal/Head name" {...register('contactPerson')} />
              <Input id="contactPhone" label="Contact Phone" placeholder="+91-XXXXXXXXXX" {...register('contactPhone')} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input id="district" label="District" placeholder="District" {...register('district')} />
              <Input id="state" label="State" placeholder="State" {...register('state')} />
              <Input id="pincode" label="PIN Code" placeholder="6-digit PIN" {...register('pincode')} />
            </div>
            <div className="flex gap-3 pt-4">
              <Button type="submit" isLoading={isLoading}>Add School</Button>
              <Link href="/dashboard/schools">
                <Button type="button" variant="outline">Cancel</Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
