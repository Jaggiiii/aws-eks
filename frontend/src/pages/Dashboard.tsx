import { useEffect, useState } from "react";
import Balance from "../components/Balance";
import UsersList from "../components/UsersList";

export default function Dashboard() {
  const token = localStorage.getItem("token");

  const [balance, setBalance] = useState(0);
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [amount, setAmount] = useState("");
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  async function fetchBalance() {
    const res = await fetch(
      "http://localhost:3000/api/v1/account/balance",
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const data = await res.json();
    setBalance(data.balance);
  }

  async function fetchUsers(filter: string) {
    const res = await fetch(
      `http://localhost:3000/api/v1/user/bulk?filter=${filter}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const data = await res.json();
    setUsers(data.users);
  }

  async function transfer(email: string) {
    await fetch("http://localhost:3000/api/v1/account/transfer", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        toEmail: email,
        amount: Number(amount),
      }),
    });

    alert("Transfer complete");
    setAmount("");
    setSelectedUser(null);
    fetchBalance();
  }

  /* Debounced search */
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers(search);
    }, 400);

    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    fetchBalance();
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 p-6 text-white">
      <h1 className="text-2xl mb-4">Dashboard</h1>

      {/* Balance Component */}
      <Balance balance={balance} />

      {/* Search input */}
      <input
        placeholder="Search users..."
        className="w-full p-2 rounded text-black mb-4"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* Users List Component */}
      <UsersList users={users} setSelectedUser={setSelectedUser} />

      {/* Transfer popup */}
      {selectedUser && (
        <div className="fixed bottom-0 left-0 right-0 bg-gray-800 p-4 flex gap-2">
          <input
            placeholder="Enter amount"
            className="flex-1 p-2 rounded text-black"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />

          <button
            onClick={() => transfer(selectedUser)}
            className="bg-green-600 px-4 rounded"
          >
            Confirm
          </button>

          <button
            onClick={() => setSelectedUser(null)}
            className="bg-red-600 px-4 rounded"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
