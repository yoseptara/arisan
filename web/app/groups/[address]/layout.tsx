import { Suspense } from 'react';

export default function GroupDetailLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return <Suspense>{children}</Suspense>;
}
