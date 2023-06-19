import { Suspense } from 'react';

export default function CreateGroupLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return <Suspense>{children}</Suspense>;
}
