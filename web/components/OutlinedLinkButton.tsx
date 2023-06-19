import Link from 'next/link';

const OutlinedLinkBtn = ({ text, route }: { text: string; route: string }) => {
  return (
    <Link
      href={route}
      className="px-4 py-6 text-xl border-2 border-gray-800 text-gray-800   rounded text-center hover:bg-blue-500 hover:text-white"
    >
      {text}
    </Link>
  );
};

export default OutlinedLinkBtn;
