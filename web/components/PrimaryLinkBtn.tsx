import Link from 'next/link';

interface PrimaryLinkBtnProps {
  text: string;
  route: string;
  className?: string;
}

export function PrimaryLinkBtn({
  text,
  route,
  className
}: PrimaryLinkBtnProps) {
  return (
    <Link
      href={route}
      className={`px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-center ${className}`}
    >
      {text}
    </Link>
  );
}
