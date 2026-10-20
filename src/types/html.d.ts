import 'react';

declare module 'react' {
  interface VideoHTMLAttributes<T> {
    loading?: 'lazy' | 'eager';
  }
  interface AudioHTMLAttributes<T> {
    loading?: 'lazy' | 'eager';
  }
}
