
import { useState, useCallback } from 'react';

interface UseFormReturn<T> {
  register: (name: keyof T, options?: any) => {
    onChange: (e: any) => void;
    value: any;
    name: string;
  };
  handleSubmit: (onSubmit: (data: T) => void) => (e: React.FormEvent) => void;
  formState: {
    errors: Partial<Record<keyof T | 'root', { message: string }>>;
  };
  setValue: (name: keyof T, value: any) => void;
  setError: (name: keyof T | 'root', error: { message: string }) => void;
  clearErrors: () => void;
  watch: () => T;
}

export function useForm<T extends Record<string, any>>(options?: {
  defaultValues?: Partial<T>;
}): UseFormReturn<T> {
  const [values, setValues] = useState<T>(options?.defaultValues as T || {} as T);
  const [errors, setErrors] = useState<Partial<Record<keyof T | 'root', { message: string }>>>({});

  const register = useCallback((name: keyof T, validationOptions?: any) => ({
    name: name as string,
    value: values[name] || '',
    onChange: (e: any) => {
      const value = e.target ? e.target.value : e;
      setValues(prev => ({ ...prev, [name]: value }));

      if (errors[name]) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
      }
    }
  }), [values, errors]);

  const handleSubmit = useCallback((onSubmit: (data: T) => void) => {
    return (e: React.FormEvent) => {
      e.preventDefault();
      onSubmit(values);
    };
  }, [values]);

  const setValue = useCallback((name: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }));
  }, []);

  const setError = useCallback((name: keyof T | 'root', error: { message: string }) => {
    setErrors(prev => ({ ...prev, [name]: error }));
  }, []);

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  const watch = useCallback(() => values, [values]);

  return {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    setError,
    clearErrors,
    watch
  };
}
