'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '@/lib/api/users';
import { authApi } from '@/lib/api/auth';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Modal } from '@/components/ui/modal';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { formatDate } from '@/lib/utils';
import { toast } from 'sonner';
import { UserCheck, UserX, Plus, Pencil, Trash2, Search } from 'lucide-react';
import { User } from '@/types';

interface EmployeeFormData {
  name: string;
  email: string;
  password: string;
  phone: string;
  role: string;
}

const emptyForm: EmployeeFormData = { name: '', email: '', password: '', phone: '', role: 'EMPLOYEE' };

export default function EmployeesPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<EmployeeFormData>(emptyForm);
  const [formErrors, setFormErrors] = useState<Partial<EmployeeFormData>>({});

  const { data, isLoading } = useQuery({
    queryKey: ['users', search],
    queryFn: async () => {
      const { data } = await usersApi.getAll({ perPage: 50, search: search || undefined });
      return data.data;
    },
  });

  const toggleMutation = useMutation({
    mutationFn: (id: string) => usersApi.toggleActive(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User status updated');
    },
    onError: () => toast.error('Failed to update user status'),
  });

  const createMutation = useMutation({
    mutationFn: (data: { email: string; password: string; name: string; role?: string; phone?: string }) =>
      authApi.register(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Employee added successfully');
      closeAddModal();
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to add employee';
      toast.error(message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<User> & { password?: string } }) =>
      usersApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Employee updated successfully');
      closeEditModal();
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to update employee';
      toast.error(message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => usersApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Employee deleted successfully');
      setDeletingUser(null);
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to delete employee';
      toast.error(message);
    },
  });

  function closeAddModal() {
    setShowAddModal(false);
    setFormData(emptyForm);
    setFormErrors({});
  }

  function openEditModal(user: User) {
    setEditingUser(user);
    setFormData({ name: user.name, email: user.email, password: '', phone: user.phone || '', role: user.role });
    setFormErrors({});
  }

  function closeEditModal() {
    setEditingUser(null);
    setFormData(emptyForm);
    setFormErrors({});
  }

  function validateForm(isEdit: boolean): boolean {
    const errors: Partial<EmployeeFormData> = {};
    if (!formData.name.trim()) errors.name = 'Name is required';
    if (!isEdit) {
      if (!formData.email.trim()) errors.email = 'Email is required';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.email = 'Invalid email address';
      if (!formData.password) errors.password = 'Password is required';
      else if (formData.password.length < 6) errors.password = 'Password must be at least 6 characters';
    } else {
      if (formData.password && formData.password.length < 6) errors.password = 'Password must be at least 6 characters';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function handleAdd() {
    if (!validateForm(false)) return;
    createMutation.mutate({
      name: formData.name.trim(),
      email: formData.email.trim(),
      password: formData.password,
      role: formData.role,
      phone: formData.phone.trim() || undefined,
    });
  }

  function handleEdit() {
    if (!editingUser || !validateForm(true)) return;
    const updateData: any = { name: formData.name.trim() };
    if (formData.phone.trim()) updateData.phone = formData.phone.trim();
    if (formData.password) updateData.password = formData.password;
    updateMutation.mutate({ id: editingUser.id, data: updateData });
  }

  if (isLoading) return <LoadingSpinner className="mt-20" size="lg" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Employees</h2>
          <p className="text-gray-500">Manage system users</p>
        </div>
        <Button onClick={() => { setFormData(emptyForm); setFormErrors({}); setShowAddModal(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          Add Employee
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Name</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Email</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Phone</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Role</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Joined</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data?.items?.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-gray-400">No employees found</td>
                  </tr>
                )}
                {data?.items?.map((user: User) => (
                  <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{user.name}</td>
                    <td className="py-3 px-4 text-gray-500">{user.email}</td>
                    <td className="py-3 px-4 text-gray-500">{user.phone || '—'}</td>
                    <td className="py-3 px-4">
                      <Badge variant={user.role === 'ADMIN' ? 'info' : 'default'}>{user.role}</Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={user.isActive ? 'success' : 'error'}>{user.isActive ? 'Active' : 'Inactive'}</Badge>
                    </td>
                    <td className="py-3 px-4 text-gray-500">{formatDate(user.createdAt)}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" onClick={() => openEditModal(user)} title="Edit">
                          <Pencil className="h-4 w-4 text-gray-500" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => toggleMutation.mutate(user.id)} title={user.isActive ? 'Deactivate' : 'Activate'}>
                          {user.isActive ? <UserX className="h-4 w-4 text-red-500" /> : <UserCheck className="h-4 w-4 text-green-500" />}
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setDeletingUser(user)} title="Delete">
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Add Employee Modal */}
      <Modal isOpen={showAddModal} onClose={closeAddModal} title="Add Employee">
        <div className="space-y-4">
          <Input
            id="add-name"
            label="Full Name"
            placeholder="John Doe"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            error={formErrors.name}
          />
          <Input
            id="add-email"
            label="Email"
            type="email"
            placeholder="john@example.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            error={formErrors.email}
          />
          <Input
            id="add-password"
            label="Password"
            type="password"
            placeholder="Minimum 6 characters"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            error={formErrors.password}
          />
          <Input
            id="add-phone"
            label="Phone (optional)"
            placeholder="+91 98765 43210"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
          <Select
            id="add-role"
            label="Role"
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            options={[
              { value: 'EMPLOYEE', label: 'Employee' },
              { value: 'ADMIN', label: 'Admin' },
            ]}
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={closeAddModal}>Cancel</Button>
            <Button onClick={handleAdd} isLoading={createMutation.isPending}>Add Employee</Button>
          </div>
        </div>
      </Modal>

      {/* Edit Employee Modal */}
      <Modal isOpen={!!editingUser} onClose={closeEditModal} title="Edit Employee">
        <div className="space-y-4">
          <Input
            id="edit-name"
            label="Full Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            error={formErrors.name}
          />
          <Input
            id="edit-email"
            label="Email"
            value={formData.email}
            disabled
            className="bg-gray-50"
          />
          <Input
            id="edit-phone"
            label="Phone"
            placeholder="+91 98765 43210"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
          <Input
            id="edit-password"
            label="New Password (leave blank to keep current)"
            type="password"
            placeholder="Minimum 6 characters"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            error={formErrors.password}
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={closeEditModal}>Cancel</Button>
            <Button onClick={handleEdit} isLoading={updateMutation.isPending}>Save Changes</Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={!!deletingUser} onClose={() => setDeletingUser(null)} title="Delete Employee">
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete <span className="font-semibold text-gray-900">{deletingUser?.name}</span>?
            This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setDeletingUser(null)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={() => deletingUser && deleteMutation.mutate(deletingUser.id)}
              isLoading={deleteMutation.isPending}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
