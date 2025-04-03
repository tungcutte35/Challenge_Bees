import { format } from 'date-fns';

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

export const formatDate = (date: string | Date): string => {
  return format(new Date(date), 'yyyy-MM-dd');
};

export const formatDateTime = (date: string | Date): string => {
  return format(new Date(date), 'yyyy-MM-dd HH:mm:ss');
};