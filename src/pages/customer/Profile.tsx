import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/store/useAuth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { User, Mail, Phone, MapPin, Camera } from 'lucide-react';
import { getTestId } from '@/utils/testUtils';

const profileSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().regex(/^\+?[0-9\s\-]{7,15}$/, 'Invalid phone number format').optional().or(z.literal('')),
  address: z.string().min(5, 'Address must be at least 5 characters').optional().or(z.literal('')),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function Profile() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = React.useState(false);
  const [successMsg, setSuccessMsg] = React.useState('');

  const { register, handleSubmit, formState: { errors } } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: user?.name || '',
      email: user?.email || '',
      phone: '+1 234 567 8900',
      address: '123 QA Avenue, Testing City, TC 12345',
    }
  });

  const onSubmit = (data: ProfileFormValues) => {
    // In a real app, send to API. Here, just show success.
    console.log('Profile updated', data);
    setSuccessMsg('Profile updated successfully!');
    setIsEditing(false);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8 text-slate-900">My Profile</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Sidebar / Avatar */}
        <div className="col-span-1">
          <div className="bg-white border border-border rounded-2xl p-6 flex flex-col items-center text-center shadow-sm">
            <div className="relative mb-4 group cursor-pointer">
              <div className="h-32 w-32 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border-4 border-white shadow-lg">
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
                ) : (
                  <User className="h-16 w-16 text-slate-400" />
                )}
              </div>
              <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="h-8 w-8 text-white" />
              </div>
            </div>
            <h2 className="text-xl font-bold text-slate-900">{user?.name}</h2>
            <p className="text-sm text-slate-500 mb-6">{user?.email}</p>
            <div className="w-full border-t border-border pt-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-500">Member Since</span>
                <span className="font-medium">Jan 2024</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Total Orders</span>
                <span className="font-medium">12</span>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="col-span-1 md:col-span-2">
          <div className="bg-white border border-border rounded-2xl p-6 sm:p-8 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-900">Personal Information</h2>
              {!isEditing && (
                <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                  Edit Profile
                </Button>
              )}
            </div>

            {successMsg && (
              <div className="mb-6 p-4 bg-success/10 text-success rounded-lg font-medium text-sm border border-success/20">
                {successMsg}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input 
                      className="pl-10" 
                      disabled={!isEditing}
                      {...register('fullName')}
                      error={errors.fullName?.message}
                      data-testid={getTestId('profile-name')}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input 
                      className="pl-10" 
                      disabled={!isEditing}
                      {...register('email')}
                      error={errors.email?.message}
                      data-testid={getTestId('profile-email')}
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input 
                      className="pl-10" 
                      disabled={!isEditing}
                      {...register('phone')}
                      error={errors.phone?.message}
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-slate-700">Shipping Address</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input 
                      className="pl-10" 
                      disabled={!isEditing}
                      {...register('address')}
                      error={errors.address?.message}
                    />
                  </div>
                </div>
              </div>

              {isEditing && (
                <div className="flex gap-4 pt-4 border-t border-border">
                  <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" data-testid={getTestId('profile-save')}>
                    Save Changes
                  </Button>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
