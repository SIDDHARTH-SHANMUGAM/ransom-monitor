  import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const loginSchema = z.object({
  email: z.string().email({
    message: 'Please enter a valid email address.',
  }),
  password: z.string().min(8, {
    message: 'Password must be at least 8 characters long.',
  }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const LoginPage = () => {
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginSuccess, setLoginSuccess] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = sessionStorage.getItem('token');
    if (token) {
      const validateToken = async () => {
        setIsLoading(true);
        try {
          const response = await axios.post(
            'http://localhost:3000/server/ransommonitor/authtoken',
            {},
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          if (response.status === 200 && response.data.isValid) {
            navigate('/app/monitor');
          } else {
            setIsLoading(false);
          }
        } catch (error) {
          console.error('Error validating token:', error);
          setIsLoading(false);
          sessionStorage.removeItem('token');
        }
      };

      validateToken();
    }
  }, [navigate]);

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    setLoginError(null);
    setLoginSuccess(false);

    try {
      const response = await axios.post(
        'http://localhost:3000/server/ransommonitor/loginAdmin',
        data
      );
      if (response.status === 200) {
        setLoginSuccess(true);
        setTimeout(() => {
          sessionStorage.setItem('token', response.data.token);
          navigate('/app/monitor');
        }, 500);
      } else {
        console.log('unexpected response code : ' + response.status);
      }
    } catch (error: any) {
      setLoginError(
        error.response?.data?.message ||
          error.message ||
          'An error occurred during login.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // If token is being validated, show a loading indicator
  if (isLoading && sessionStorage.getItem('token')) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <svg
            className="animate-spin h-12 w-12 text-blue-500 mx-auto"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <p className="mt-3 text-gray-500">Checking session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-[350px] shadow-lg bg-white rounded-lg p-6">
        <div className="text-center">
          <h2 className="text-2xl font-semibold">Login</h2>
          <p className="text-gray-500">
            Welcome back! Please enter your credentials to log in.
          </p>
        </div>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              id="email"
              {...form.register('email')}
              placeholder="Enter your email"
              className={`mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                isLoading || loginSuccess ? 'cursor-not-allowed opacity-70' : ''
              }`}
              disabled={isLoading || loginSuccess}
              autoComplete="email"
            />
            {form.formState.errors.email && (
              <p className="text-red-500 text-xs mt-1">
                {form.formState.errors.email.message}
              </p>
            )}
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              {...form.register('password')}
              placeholder="Enter your password"
              className={`mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                isLoading || loginSuccess ? 'cursor-not-allowed opacity-70' : ''
              }`}
              disabled={isLoading || loginSuccess}
              autoComplete="current-password"
            />
            {form.formState.errors.password && (
              <p className="text-red-500 text-xs mt-1">
                {form.formState.errors.password.message}
              </p>
            )}
          </div>

          {loginError && (
            <div className="text-red-500 text-sm">{loginError}</div>
          )}

          {loginSuccess && (
            <div className="text-green-500 text-sm">
              Login successful! Redirecting...
            </div>
          )}

          <button
            type="submit"
            className={`w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${
              isLoading || loginSuccess ? 'cursor-not-allowed opacity-70' : ''
            }`}
            disabled={isLoading || loginSuccess}
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin h-5 w-5 mr-3"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Logging in...
              </>
            ) : (
              'Login'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;