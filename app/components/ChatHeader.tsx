import { FiMoreHorizontal, FiSearch } from "react-icons/fi";

function ChatHeader({
  activeChat,
  staticAvatar,
  user,
}: {
  activeChat: any;
  staticAvatar: string;
  user: any;
}) {
  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-none">
      <div className="flex items-center space-x-3">
        <img
          src={staticAvatar}
          alt={activeChat._id}
          className="w-10 h-10 rounded-full object-cover"
        />
        <div>
          <div className="font-semibold">
            {activeChat.participants?.find(
              (p: any) =>
                p.username.toLowerCase() !== user.username.toLowerCase()
            )?.username || "Conversation"}
          </div>
          <div className="text-xs text-gray-500">
            {activeChat.onlineStatus || ""}
          </div>
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <button className="p-2 rounded hover:bg-gray-100">
          <FiSearch size={18} />
        </button>
        <button className="p-2 rounded hover:bg-gray-100">
          <FiMoreHorizontal size={18} />
        </button>
      </div>
    </div>
  );
}

export default ChatHeader;
