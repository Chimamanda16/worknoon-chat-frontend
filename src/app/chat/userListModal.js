"use client";

import { useEffect, useState } from "react";
import API from "@/lib/api";

export default function UserListModal({
  open,
  onClose,
  onChatCreated,
}) {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    if (open) {
      fetchUsers();
    }
  }, [open]);

  const fetchUsers = async () => {
    try {
      const { data } = await API.get("/auth/users");

      setUsers(data);
    } catch (error) {
      console.log(error);
    }
  };

  const createConversation = async (participantId) => {
    try {
      const { data } = await API.post("/conversations", {
        participantId,
      });

      onChatCreated(data);

      onClose();
    } catch (error) {
      console.log(error);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-md rounded-2xl p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            Start Conversation
          </h2>

          <button className="cursor-pointer" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="space-y-3 max-h-[400px] overflow-y-auto">
          {users.map((user) => (
            <div
              key={user._id}
              className="flex justify-between items-center border p-3 rounded-xl"
            >
              <div>
                <h3 className="font-semibold">
                  {user.name}
                </h3>

                <p className="text-sm text-gray-500">
                  {user.role}
                </p>
              </div>

              <button
                onClick={() =>
                  createConversation(user._id)
                }
                className="bg-black cursor-pointer text-white px-4 py-2 rounded-lg"
              >
                Chat
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}