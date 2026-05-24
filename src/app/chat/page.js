"use client";

import { useEffect, useState } from "react";
import API from "@/lib/api";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

export default function ChatPage() {
  const [conversations, setConversations] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);

  const [messages, setMessages] = useState([]);

  const [newMessage, setNewMessage] = useState("");

  const [typing, setTyping] = useState(false);

  const [onlineUsers, setOnlineUsers] = useState([]);

  const userInfo =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("userInfo"))
      : null;

  // FETCH CONVERSATIONS
  const fetchConversations = async () => {
    try {
      const { data } = await API.get("/conversations");

      setConversations(data);
    } catch (error) {
      console.log(error);
    }
  };

  // FETCH MESSAGES
  const fetchMessages = async (conversationId) => {
    try {
      const { data } = await API.get(
        `/messages/${conversationId}`
      );

      setMessages(data);

      socket.emit("joinConversation", conversationId);
    } catch (error) {
      console.log(error);
    }
  };

  // SEND MESSAGE
  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const { data } = await API.post("/messages", {
        conversationId: selectedChat._id,
        content: newMessage,
      });

      socket.emit("sendMessage", data);

      setMessages((prev) => [...prev, data]);

      setNewMessage("");
    } catch (error) {
      console.log(error);
    }
  };

  // SOCKET SETUP
  useEffect(() => {
    if (userInfo?._id) {
      socket.emit("setup", userInfo._id);
    }

    socket.on("newMessage", (message) => {
      if (
        selectedChat &&
        message.conversation._id === selectedChat._id
      ) {
        setMessages((prev) => [...prev, message]);
      }
    });

    socket.on("typing", () => {
      setTyping(true);
    });

    socket.on("stopTyping", () => {
      setTyping(false);
    });

    socket.on("onlineUsers", (users) => {
      setOnlineUsers(users);
    });

    return () => {
      socket.off("newMessage");
      socket.off("typing");
      socket.off("stopTyping");
      socket.off("onlineUsers");
    };
  }, [selectedChat]);

  useEffect(() => {
    fetchConversations();
  }, []);

  return (
    <div className="h-screen flex bg-gray-100">
      {/* SIDEBAR */}
      <div className="w-1/3 bg-white border-r overflow-y-auto">
        <div className="p-4 border-b">
          <h1 className="text-2xl font-bold">
            Messages
          </h1>
        </div>

        {conversations.map((conversation) => {
          const otherUser = conversation.participants.find(
            (p) => p._id !== userInfo._id
          );

          return (
            <div
              key={conversation._id}
              onClick={() => {
                setSelectedChat(conversation);
                fetchMessages(conversation._id);
              }}
              className="p-4 border-b cursor-pointer hover:bg-gray-50"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-semibold">
                    {otherUser?.name}
                  </h2>

                  <p className="text-sm text-gray-500">
                    {otherUser?.role}
                  </p>
                </div>

                {onlineUsers.includes(otherUser?._id) && (
                  <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* CHAT AREA */}
      <div className="flex-1 flex flex-col">
        {selectedChat ? (
          <>
            {/* HEADER */}
            <div className="p-4 border-b bg-white">
              <h2 className="font-bold text-lg">
                {
                  selectedChat.participants.find(
                    (p) => p._id !== userInfo._id
                  )?.name
                }
              </h2>

              {typing && (
                <p className="text-sm text-gray-500">
                  Typing...
                </p>
              )}
            </div>

            {/* MESSAGES */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((message) => (
                <div
                  key={message._id}
                  className={`max-w-xs p-3 rounded-2xl ${
                    message.sender._id === userInfo._id
                      ? "bg-black text-white ml-auto"
                      : "bg-white"
                  }`}
                >
                  {message.content}
                </div>
              ))}
            </div>

            {/* INPUT */}
            <div className="p-4 bg-white border-t flex gap-2">
              <input
                type="text"
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => {
                  setNewMessage(e.target.value);

                  socket.emit(
                    "typing",
                    selectedChat._id
                  );

                  setTimeout(() => {
                    socket.emit(
                      "stopTyping",
                      selectedChat._id
                    );
                  }, 1000);
                }}
                className="flex-1 border rounded-full px-4 py-3"
              />

              <button
                onClick={handleSendMessage}
                className="bg-black text-white px-6 rounded-full"
              >
                Send
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-gray-500">
              Select a conversation
            </p>
          </div>
        )}
      </div>
    </div>
  );
}