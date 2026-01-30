import { useEffect, useRef } from "react";
import { useAuthStore } from "../store/useauthstore";
import { useChatStore } from "../store/useChatStore";
import ChatHeader from "./chatHeader";
import NoChatHistoryPlaceholder from "./NoChatHistoryPlaceholder";
import MessageInput from "./MessageInput";
import MessagesLoadingSkeleton from "./MessagesLoadingSkeleton";

function ChatContainer() {
  const {
    selectedUser,
    getMessageByUserId,
    messages,
   isMessagesLoading,
    subscribeToMessages,
    unsubscribeFromMessages,
  } = useChatStore();
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);

  // Fetch messages when selectedUser changes
  useEffect(() => {
    if (selectedUser?._id) {
      getMessageByUserId(selectedUser._id);
      subscribeToMessages();
    }
    
    return () => unsubscribeFromMessages();
  }, [selectedUser?._id, getMessageByUserId, subscribeToMessages, unsubscribeFromMessages]);

  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);
  

  return (
    <div className="flex flex-col h-full w-full">
      <ChatHeader />
      <div className="flex-1 px-3 sm:px-4 md:px-6 overflow-y-auto py-6 md:py-8">
        {messages.length > 0 ? (
          <div className="max-w-full md:max-w-3xl mx-auto space-y-4 md:space-y-6">
            {messages.map((msg) => (
              <div
                key={msg._id}
                className={`chat ${msg.senderId === authUser._id ? "chat-end" : "chat-start"}`}
              >
                <div
                  className={`chat-bubble relative ${
                    msg.senderId === authUser._id
                      ? "bg-cyan-600 text-white"
                      : "bg-slate-800 dark:bg-slate-800 text-white dark:text-slate-200"
                  } max-w-[78vw] md:max-w-[70%] break-words whitespace-pre-wrap p-3 md:p-4 text-sm md:text-base rounded-xl md:rounded-2xl`}
                >
                  {msg.image && (
                    <img src={msg.image} alt="Shared" className="rounded-lg w-full h-auto max-h-48 md:max-h-64 object-cover" />
                  )}
                  {msg.text && <p className="mt-2">{msg.text}</p>}
                  <p className="text-[10px] md:text-xs mt-1 opacity-75 flex items-center gap-1">
                    {new Date(msg.createdAt).toLocaleTimeString(undefined, {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))}
            {/* 👇 scroll target */}
            <div ref={messageEndRef} />
          </div>
        ) : (
          <NoChatHistoryPlaceholder name={selectedUser.name} />
        )}
      </div>

      <MessageInput />
    </div>
  );
}

export default ChatContainer;