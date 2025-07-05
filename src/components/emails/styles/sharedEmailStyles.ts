import { env } from '@/lib/env';

export const domain = env.NEXT_PUBLIC_BASE_URL;

export const main = { backgroundColor: '#f8fafc', padding: '10px 0' };

export const container = {
  backgroundColor: '#ffffff',
  border: '1px solid #e5e7eb',
  padding: '40px',
  borderRadius: '8px',
};

export const text = {
  fontSize: '16px',
  fontFamily: "'Arial', sans-serif",
  color: '#374151',
  lineHeight: '24px',
};

export const button = {
  backgroundColor: '#09090b',
  borderRadius: '6px',
  color: '#ffffff',
  fontFamily: "'Arial', sans-serif",
  fontSize: '16px',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  width: '200px',
  padding: '12px',
  margin: '20px auto',
};

export const headerSection = {
  textAlign: 'center' as const,
  marginBottom: '24px',
};

export const logoStyle = {
  margin: '0 auto',
  borderRadius: '8px',
};
