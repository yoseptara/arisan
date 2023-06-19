import { Suspense } from 'react';

export default function GroupMembersLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return <Suspense>{children}</Suspense>;
}
