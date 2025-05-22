import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { API_BASE_URL } from '@/config';
import { Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';

const passwordRequirements = {
  minLength: 8,
  hasUppercase: /[A-Z]/,
  hasLowercase: /[a-z]/,
  hasNumber: /[0-9]/,
  hasSpecialChar: /[^A-Za-z0-9]/,
};

const registerSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z
    .string()
    .min(
      passwordRequirements.minLength,
      `Password must be at least ${passwordRequirements.minLength} characters`
    )
    .regex(
      passwordRequirements.hasUppercase,
      'Password must contain at least one uppercase letter'
    )
    .regex(
      passwordRequirements.hasLowercase,
      'Password must contain at least one lowercase letter'
    )
    .regex(
      passwordRequirements.hasNumber,
      'Password must contain at least one number'
    )
    .regex(
      passwordRequirements.hasSpecialChar,
      'Password must contain at least one special character'
    ),
  confirmPassword: z.string(),
  acceptTerms: z.boolean().refine(val => val === true, {
    message: 'You must accept the terms and conditions',
  }),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const Register: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  // Get token from URL ?token=...
  const token = searchParams.get('token') || '';

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      acceptTerms: false,
    },
    mode: 'onBlur', // Only validate on blur instead of onChange
    criteriaMode: 'firstError', // Only show first error to reduce validation work
  });
  
  // Calculate password strength (memoized to avoid recalculation)
  const calculatePasswordStrength = React.useCallback((password: string) => {
    if (!password) return 0;
    
    let strength = 0;
    if (password.length >= passwordRequirements.minLength) strength += 20;
    if (passwordRequirements.hasUppercase.test(password)) strength += 20;
    if (passwordRequirements.hasLowercase.test(password)) strength += 20;
    if (passwordRequirements.hasNumber.test(password)) strength += 20;
    if (passwordRequirements.hasSpecialChar.test(password)) strength += 20;
    
    return strength;
  }, []);
  
  // Debounce function to limit updates
  function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);
  
    useEffect(() => {
      const handler = setTimeout(() => {
        setDebouncedValue(value);
      }, delay);
  
      return () => {
        clearTimeout(handler);
      };
    }, [value, delay]);
  
    return debouncedValue;
  }
  
  // Get password from form and debounce it
  const password = form.watch('password');
  const debouncedPassword = useDebounce(password, 300); // 300ms delay
  
  // Update password strength only when debounced password changes
  React.useEffect(() => {
    if (debouncedPassword !== undefined) {
      setPasswordStrength(calculatePasswordStrength(debouncedPassword));
    }
  }, [debouncedPassword, calculatePasswordStrength]);

  const onSubmit = async (data: z.infer<typeof registerSchema>) => {
    setError(null);
    setSuccess(false);
    setIsLoading(true);
    if (!token) {
      setError('No invitation token provided in URL.');
      setIsLoading(false);
      return;
    }
    try {
      // Remove confirmPassword and acceptTerms before sending to API
      const { confirmPassword, acceptTerms, ...submitData } = data;
      
      const response = await fetch(`${API_BASE_URL}/api/register/${token}/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(submitData)
      });
      const result = await response.json();
      if (result.success) {
        setSuccess(true);
        setTimeout(() => navigate('/login'), 1500);
      } else {
        setError(result.error || JSON.stringify(result.errors));
      }
    } catch (err) {
      setError('Registration failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-playfair font-semibold text-salon-800 mb-2">
            Register (by Invitation)
          </h1>
          <p className="text-muted-foreground">
            Create your salon management account
          </p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Sign Up</CardTitle>
            <CardDescription>
              Enter your details to create your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input placeholder="Your username" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="you@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Password" {...field} />
                      </FormControl>
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span>Password strength</span>
                          <span>
                            {passwordStrength < 40 ? 'Weak' : 
                             passwordStrength < 80 ? 'Medium' : 'Strong'}
                          </span>
                        </div>
                        <Progress value={passwordStrength} className="h-2" />
                        <ul className="text-xs space-y-1">
                          <li className="flex items-center gap-1">
                            {field.value?.length >= passwordRequirements.minLength ? 
                              <Check className="h-3 w-3 text-green-500" /> : 
                              <X className="h-3 w-3 text-red-500" />}
                            At least {passwordRequirements.minLength} characters
                          </li>
                          <li className="flex items-center gap-1">
                            {passwordRequirements.hasUppercase.test(field.value || '') ? 
                              <Check className="h-3 w-3 text-green-500" /> : 
                              <X className="h-3 w-3 text-red-500" />}
                            At least one uppercase letter
                          </li>
                          <li className="flex items-center gap-1">
                            {passwordRequirements.hasLowercase.test(field.value || '') ? 
                              <Check className="h-3 w-3 text-green-500" /> : 
                              <X className="h-3 w-3 text-red-500" />}
                            At least one lowercase letter
                          </li>
                          <li className="flex items-center gap-1">
                            {passwordRequirements.hasNumber.test(field.value || '') ? 
                              <Check className="h-3 w-3 text-green-500" /> : 
                              <X className="h-3 w-3 text-red-500" />}
                            At least one number
                          </li>
                          <li className="flex items-center gap-1">
                            {passwordRequirements.hasSpecialChar.test(field.value || '') ? 
                              <Check className="h-3 w-3 text-green-500" /> : 
                              <X className="h-3 w-3 text-red-500" />}
                            At least one special character
                          </li>
                        </ul>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Confirm your password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="acceptTerms"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 py-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-sm font-normal">
                          I accept the{' '}
                          <Link to="/terms" className="text-salon-600 hover:text-salon-700 underline">
                            Terms of Service
                          </Link>{' '}
                          and{' '}
                          <Link to="/privacy" className="text-salon-600 hover:text-salon-700 underline">
                            Privacy Policy
                          </Link>
                        </FormLabel>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
                
                <Button
                  type="submit"
                  className="w-full bg-salon-600 hover:bg-salon-700"
                  disabled={isLoading}
                >
                  {isLoading ? 'Registering...' : 'Register'}
                </Button>
              </form>
            </Form>
            {error && (
              <div className="text-red-600 mt-4 text-center">{error}</div>
            )}
            {success && (
              <div className="text-green-600 mt-4 text-center">Registration successful! Redirecting...</div>
            )}
            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="text-salon-600 hover:text-salon-700 font-medium"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Register;
