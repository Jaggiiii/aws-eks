type Props = {
  balance: number;
};

export default function Balance({ balance }: Props) {
  return (
    <div className="bg-gray-800 p-4 rounded mb-6 text-white">
      Balance: ₹{balance}
    </div>
  );
}
