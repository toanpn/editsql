import { locales } from '@/i18n/config';
import { ReactNode } from 'react';

type Props = {
  children: ReactNode;
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default function RootLayout({ children }: Props) {
  return children;
}

