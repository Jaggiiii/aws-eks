type User = {
  id: string;
  name: string;
  email: string;
};

type Props = {
  users: User[];
  setSelectedUser: (email: string) => void;
};

export default function UsersList({ users, setSelectedUser }: Props) {
  return (
    <>
      {users.map((u) => (
        <div key={u.id} className="bg-gray-800 p-3 rounded mb-2 text-white">
          <div className="flex justify-between items-center">
            <div>
              {u.name} ({u.email})
            </div>

            <button
              onClick={() => setSelectedUser(u.email)}
              className="bg-blue-600 px-3 py-1 rounded"
            >
              Send
            </button>
          </div>
        </div>
      ))}
    </>
  );
}
