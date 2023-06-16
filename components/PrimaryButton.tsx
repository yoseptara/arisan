interface PrimaryBtnProps {
  text: string;
  onClick?: () => void;
  className?: string;
}

export function PrimaryBtn({ text, onClick, className }: PrimaryBtnProps) {
  return (
    <button
      className={`px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 ${className}`}
      onClick={onClick}
    >
      {text}
    </button>
  );
}
