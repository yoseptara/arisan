const OutlinedBtn = ({
  text,
  onClick
}: {
  text: string;
  onClick: () => void;
}) => {
  return (
    <button
      onClick={onClick}
      className="border-2 border-gray-800 text-gray-800 px-4 py-2 rounded text-center hover:bg-blue-500 hover:text-white"
    >
      {text}
    </button>
  );
};

export default OutlinedBtn;
