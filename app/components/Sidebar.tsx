import { FiMoreHorizontal, FiSearch } from "react-icons/fi";

function Sidebar({
  staticAvatar,
  user,
  searchTerm,
  setSearchTerm,
  filteredItems,
  loadingUsers,
  loadingConvos,
  handleUserClick,
  handleConversationSelect,
}: {
  staticAvatar: string;
  user: any;
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  filteredItems: any[];
  loadingUsers: boolean;
  loadingConvos: boolean;
  handleUserClick: (clickedUser: any) => void;
  handleConversationSelect: (convo: any) => void;
}) {
  return (
    <aside className="w-72 md:w-72 border-r border-gray-200 flex flex-col h-full">
      {/* Sidebar Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <img
            src={staticAvatar}
            alt={user.username}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div>
            <div className="font-semibold text-base">{user.username}</div>
            <div className="text-xs text-gray-500">Online</div>
          </div>
        </div>
        <button className="p-2 rounded hover:bg-gray-100">
          <FiMoreHorizontal size={18} />
        </button>
      </div>

      {/* Search Input */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center bg-white rounded-md px-2">
          <FiSearch className="text-gray-500" size={16} />
          <input
            type="text"
            placeholder="Search or start new chat"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 bg-transparent p-2 text-sm focus:outline-none"
          />
        </div>
      </div>

      {/* Conversation/User List */}
      <div className="flex-1 overflow-y-auto">
        {searchTerm ? (
          loadingUsers ? (
            <div className="p-4 text-center text-gray-500">
              Loading users...
            </div>
          ) : filteredItems.length > 0 ? (
            filteredItems.map((u: any) => (
              <button
                key={u._id}
                onClick={() => handleUserClick(u)}
                className="w-full text-left px-4 py-3 flex items-center hover:bg-gray-50 cursor-pointer"
              >
                <img
                  src={staticAvatar}
                  alt={u.username}
                  className="w-10 h-10 rounded-full object-cover mr-3"
                />
                <div>
                  <div className="font-semibold">{u.username}</div>
                  <div className="text-xs text-gray-500">{u.email}</div>
                </div>
              </button>
            ))
          ) : (
            <div className="p-4 text-center text-gray-500">No users found.</div>
          )
        ) : loadingConvos ? (
          <div className="p-4 text-center text-gray-500">
            Loading conversations...
          </div>
        ) : filteredItems.length > 0 ? (
          filteredItems.map((convo: any) => {
            const isConversation = convo.participants !== undefined;
            const unreadCount =
              isConversation && convo.unreadCounts
                ? convo.unreadCounts[user._id] || 0
                : 0;
            const participant = isConversation
              ? convo.participants.find(
                  (p: any) =>
                    p.username.toLowerCase() !== user.username.toLowerCase()
                )
              : null;
            const title = participant?.username || "Conversation";
            const preview = convo.lastMessage?.text || "No messages yet";
            return (
              <button
                key={convo._id}
                onClick={() => handleConversationSelect(convo)}
                className="w-full text-left px-4 py-3 flex items-center hover:bg-gray-50 relative cursor-pointer"
              >
                <img
                  src={staticAvatar}
                  alt={title}
                  className="w-10 h-10 rounded-full object-cover mr-3"
                />
                <div className="flex-1">
                  <div className="font-semibold">{title}</div>
                  <div className="text-xs text-gray-500">
                    {preview.length > 20
                      ? `${preview.slice(0, 20)}...`
                      : preview}
                  </div>
                </div>
                {unreadCount > 0 && (
                  <div className="bg-red-500 text-white rounded-full text-xs w-6 h-6 flex items-center justify-center absolute right-4">
                    {unreadCount}
                  </div>
                )}
              </button>
            );
          })
        ) : (
          <div className="p-4 text-center text-gray-500">
            No conversations found.
          </div>
        )}
      </div>
    </aside>
  );
}

export default Sidebar;
