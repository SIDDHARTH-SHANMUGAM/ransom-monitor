import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import axios, { AxiosResponse } from 'axios';
import { useNavigate } from 'react-router-dom';

interface Message {
  text: string;
  type: 'success' | 'error';
}

const addAdminSchema = z.object({
  adminName: z.string().min(2, {
    message: 'Admin name must be at least 2 characters long.',
  }),
  adminEmail: z.string().email({
    message: 'Please enter a valid email address.',
  }),
  adminMobile: z.string().regex(/^\d{10}$/, {
    message: 'Please enter a valid 10-digit mobile number.',
  }),
  adminPassword: z.string().min(8, {
    message: 'Password must be at least 8 characters long.',
  }),
  confirmPassword: z.string().min(8, {
    message: 'Confirm password must be at least 8 characters long.',
  }),
}).refine((data) => data.adminPassword === data.confirmPassword, {
  message: "Passwords don't match.",
  path: ['confirmPassword'],
});

type AddAdminFormValues = z.infer<typeof addAdminSchema>;

interface AddAdminResponse {
  message: string;
}

const AddAdminPage = () => {
  const form = useForm<AddAdminFormValues>({
    resolver: zodResolver(addAdminSchema),
    defaultValues: {
      adminName: '',
      adminEmail: '',
      adminMobile: '',
      adminPassword: '',
      confirmPassword: '',
    },
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [addAdminError, setAddAdminError] = useState<string | null>(null);
  const [addAdminSuccess, setAddAdminSuccess] = useState<string | null>(null);
  const [message, setMessage] = useState<Message | null>(null);
  const navigate = useNavigate();

  const onSubmit = async (data: AddAdminFormValues) => {
    setIsLoading(true);
    setAddAdminError(null);
    setAddAdminSuccess(null);
    setMessage(null); // Clear any previous messages

    try {
      const token = sessionStorage.getItem('token');
      const response: AxiosResponse<AddAdminResponse> = await axios.post(
        'http://localhost:3000/server/ransommonitor/addAdmin',
        {
          adminName: data.adminName,
          adminEmail: data.adminEmail,
          adminMobile: data.adminMobile,
          adminPassword: data.adminPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log('Admin added successfully!', response.data);
      setAddAdminSuccess(response.data.message || 'Admin added successfully!');
      form.reset();

    } catch (error: any) {
      console.error('Error adding admin:', error);
      if (error.response && error.response.status === 401) {
        setMessage({ text: 'You are not authorized to perform this action. Please log in again.', type: 'error' });
        // sessionStorage.removeItem('token');
        setTimeout(() => {
          navigate('/app');
        }, 1500);
      } else {
        setAddAdminError(
          error.response?.data?.message || error.message || 'An error occurred while adding the admin.'
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-[400px] shadow-lg bg-white rounded-lg p-8">
        <div className="text-center">
          <h2 className="text-2xl font-semibold">Add New Admin</h2>
          <p className="text-gray-500 mt-1">Please fill out the form to create a new administrator account.</p>
        </div>

        {message && (
          <div className={`mt-4 p-3 rounded-md text-white ${message.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-6">
          <div>
            <label htmlFor="adminName" className="block text-sm font-medium text-gray-700">
              Admin Name
            </label>
            <input
              type="text"
              id="adminName"
              {...form.register('adminName')}
              placeholder="Enter admin name"
              className={`mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                isLoading ? 'cursor-not-allowed opacity-70' : ''
              }`}
              disabled={isLoading}
            />
            {form.formState.errors.adminName && (
              <p className="text-red-500 text-xs mt-1">{form.formState.errors.adminName.message}</p>
            )}
          </div>
          <div>
            <label htmlFor="adminEmail" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              id="adminEmail"
              {...form.register('adminEmail')}
              placeholder="Enter admin email"
              className={`mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                isLoading ? 'cursor-not-allowed opacity-70' : ''
              }`}
              disabled={isLoading}
            />
            {form.formState.errors.adminEmail && (
              <p className="text-red-500 text-xs mt-1">{form.formState.errors.adminEmail.message}</p>
            )}
          </div>
          <div>
            <label htmlFor="adminMobile" className="block text-sm font-medium text-gray-700">
              Mobile Number
            </label>
            <input
              type="tel"
              id="adminMobile"
              {...form.register('adminMobile')}
              placeholder="Enter 10-digit mobile number"
              className={`mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                isLoading ? 'cursor-not-allowed opacity-70' : ''
              }`}
              disabled={isLoading}
            />
            {form.formState.errors.adminMobile && (
              <p className="text-red-500 text-xs mt-1">{form.formState.errors.adminMobile.message}</p>
            )}
          </div>
          <div>
            <label htmlFor="adminPassword" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              id="adminPassword"
              {...form.register('adminPassword')}
              placeholder="Enter password (min 8 characters)"
              className={`mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                isLoading ? 'cursor-not-allowed opacity-70' : ''
              }`}
              disabled={isLoading}
            />
            {form.formState.errors.adminPassword && (
              <p className="text-red-500 text-xs mt-1">{form.formState.errors.adminPassword.message}</p>
            )}
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              {...form.register('confirmPassword')}
              placeholder="Confirm password"
              className={`mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                isLoading ? 'cursor-not-allowed opacity-70' : ''
              }`}
              disabled={isLoading}
            />
            {form.formState.errors.confirmPassword && (
              <p className="text-red-500 text-xs mt-1">{form.formState.errors.confirmPassword.message}</p>
            )}
          </div>

          {addAdminError && (
            <div className="text-red-500 text-sm">{addAdminError}</div>
          )}
          {addAdminSuccess && (
            <div className="text-green-500 text-sm">{addAdminSuccess}</div>
          )}

          <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            disabled={isLoading}
          >
            {isLoading ? 'Creating Admin...' : 'Create Admin'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddAdminPage;