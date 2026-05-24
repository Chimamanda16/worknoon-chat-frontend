"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import API from "@/lib/api";
import { io } from "socket.io-client";
import UserListModal from "./userListModal";
import { useRouter } from "next/navigation";
import { getUser } from "@/lib/auth";



const socket = io("http://localhost:5000");

export default function ChatPage() {
  const [conversations, setConversations] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [messages, setMessages] = useState([]);
  const [mobileView, setMobileView] = useState("list"); 
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState("");

  const [typing, setTyping] = useState(false);

  const [onlineUsers, setOnlineUsers] = useState([]);

  const router = useRouter();
  const messagesEndRef = useRef(null);
  const selectedChatRef = useRef(null);

  const addMessage = useCallback((message) => {
    setMessages((prev) => {
      if (prev.some((item) => item._id === message._id)) {
        return prev;
      }

      return [...prev, message];
    });
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const user = getUser();

    if (!user) {
        router.push("/login");
    }
  }, [router]);

  const userInfo = getUser();

  // FETCH CONVERSATIONS
  const fetchConversations = useCallback(async (showLoading = true) => {
        try {
            if (showLoading) {
              setLoading(true);
            }

            const { data } = await API.get("/conversations");
            setConversations(data);

        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    }, []);

  // FETCH MESSAGES
  const fetchMessages = async (conversationId) => {
    try {
      const { data } = await API.get(
        `/messages/${conversationId}`
      );

      setMessages(data);
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

      addMessage(data);
      fetchConversations(false);

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

      // Update open chat messages
      if (
        selectedChatRef.current &&
        message.conversation._id === selectedChatRef.current._id
      ) {
        addMessage(message);
      }

      // Refresh conversations list in realtime
      fetchConversations(false);
    });

    socket.on("conversationUpdated", ({ message }) => {
      if (
        selectedChatRef.current &&
        message.conversation._id === selectedChatRef.current._id
      ) {
        addMessage(message);
      }

      fetchConversations(false);
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
      socket.off("conversationUpdated");
      socket.off("typing");
      socket.off("stopTyping");
      socket.off("onlineUsers");
    };
  }, [addMessage, fetchConversations, userInfo?._id]);

  useEffect(() => {
    const previousChatId = selectedChatRef.current?._id;

    if (previousChatId && previousChatId !== selectedChat?._id) {
      socket.emit("leaveConversation", previousChatId);
    }

    selectedChatRef.current = selectedChat;

    if (selectedChat?._id) {
      socket.emit("joinConversation", selectedChat._id);
    }

    return () => {
      if (selectedChat?._id) {
        socket.emit("leaveConversation", selectedChat._id);
      }
    };
  }, [selectedChat]);

  useEffect(() => {
    let isMounted = true;

    const loadConversations = async () => {
      try {
        const { data } = await API.get("/conversations");

        if (isMounted) {
          setConversations(data);
        }
      } catch (error) {
        console.log(error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadConversations();

    return () => {
      isMounted = false;
    };
  }, [router]);

  return (
    <div className="h-screen flex flex-col md:flex-row bg-gray-100">
      {/* SIDEBAR */}
      <div className={`w-full md:w-1/3 h-screen bg-white border-r overflow-y-auto md:h-full ${mobileView === "chat" ? "hidden md:block" : ""}`}>
        <div className="p-4 border-b flex items-center justify-between">
  <h1 className="text-xl md:text-2xl font-bold">
    Messages
  </h1>

  <div className="flex items-center gap-2">
    <button
      onClick={() => setOpenModal(true)}
      className="bg-black text-white px-3 py-2 rounded-full text-sm cursor-pointer"
    >
      +
    </button>

    <button
      onClick={() => {
        localStorage.removeItem("userInfo");
        window.location.href = "/login";
      }}
      className="text-sm cursor-pointer bg-red-500 text-white px-3 py-2 rounded-full"
    >
      Logout
    </button>
  </div>
</div>
        {!loading && conversations.length === 0 && (
            <p className="p-4 text-gray-500">
                No conversations yet. Start one using the + button.
            </p>
        )}
        {loading ? (
            <p className="p-4 text-gray-500">Loading chats...</p>
            ) : (
            conversations.map((conversation) => {
                const otherUser = conversation.participants.find(
                (p) => p._id !== userInfo._id
                );
                const unreadCount =
                conversation.lastMessage &&
                !conversation.lastMessage.readBy?.includes(userInfo._id)
                    ? 1
                    : 0;

            return (
                <div
                key={conversation._id}
                onClick={() => {
                    setSelectedChat(conversation);
                    fetchMessages(conversation._id);
                    setMobileView("chat");
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
                    {unreadCount > 0 && (
                        <span className="bg-black text-white text-xs px-2 py-1 rounded-full">
                            New
                        </span>
                        )}
                    </div>

                    {onlineUsers.includes(otherUser?._id) && (
                    <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                    )}
                </div>
                </div>
            );
            })
        )}
      </div>

      {/* CHAT AREA */}
      <div className={`flex-1 flex flex-col h-2/3 md:h-full ${mobileView === "list" ? "hidden md:flex" : "flex"}`}>
        {selectedChat ? (
          <>
            {/* HEADER */}
            <div className="p-4 border-b bg-white">
                <div className="flex gap-4">

                    <button
                        className="md:hidden text-sm cursor-pointer"
                        onClick={() => setMobileView("list")}
                        >
                        ← Back
                    </button>
              <h2 className="font-bold text-lg">
                {
                    selectedChat.participants.find(
                        (p) => p._id !== userInfo._id
                    )?.name
                }
              </h2>
                </div>

              {typing && (
                <p className="text-sm text-gray-500">
                  Typing...
                </p>
              )}
            </div>

            {/* MESSAGES */}
            <div className="flex-1 overflow-y-auto p-3 md:p-4 pb-20 md:pb-4 space-y-3">
                {messages.length === 0 && (
                    <div className="flex-1 flex items-center justify-center text-gray-400">
                        Say hi 👋
                    </div>
                )}
              {messages.map((message) => (
                <div
                  key={message._id}
                  className={`max-w-sm px-4 py-3 rounded-3xl shadow-sm ${
                    message.sender._id === userInfo._id
                      ? "bg-black text-white ml-auto"
                      : "bg-white"
                  }`}
                >
                  {message.content}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* INPUT */}
            <div className="p-3 md:p-4 bg-white border-t flex gap-2 sticky bottom-0">
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
                className="flex-1 border rounded-full px-3 md:px-4 py-2 md:py-3 text-sm md:text-base"
              />

              <button
                onClick={handleSendMessage}
                className="bg-black text-white px-4 md:px-6 py-2 rounded-full text-sm md:text-base"
              >
                Send
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-gray-500">
              Start a conversation with a customer, merchant, designer or support agent.
            </p>
          </div>
        )}
      </div>
      <UserListModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onChatCreated={(conversation) => {
            setConversations((prev) => {
              const withoutDuplicate = prev.filter(
                (item) => item._id !== conversation._id
              );

              return [
                conversation,
                ...withoutDuplicate,
              ];
            });
        }}
        />
    </div>
  );
}
