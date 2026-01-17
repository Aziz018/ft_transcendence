import React, { useState } from "react";
import Navigation from "./Navigation";

export const NavigationDemo = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [notificationCount, setNotificationCount] = useState(3);
  const [messageCount, setMessageCount] = useState(2);

  const handleSearch = (query: string) => {
    console.log("Search query:", query);
    setSearchQuery(query);
  };

  const handleNotificationClick = () => {
    console.log("Notifications clicked");
    alert("Notifications panel would open here");
  };

  const handleMessageClick = () => {
    console.log("Messages clicked");
    alert("Messages panel would open here");
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation Bar */}
      <Navigation
        userName="Totok Michael"
        userEmail="tmichael@gmail.com"
        userAvatar="https://api.dicebear.com/7.x/avataaars/svg?seed=totok"
        onSearch={handleSearch}
        onNotificationClick={handleNotificationClick}
        onMessageClick={handleMessageClick}
        notificationCount={notificationCount}
        messageCount={messageCount}
      />

      {/* Main Content (add padding to account for fixed nav) */}
      <main className="pt-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Navigation Bar Demo
          </h1>

          <div className="bg-white rounded-lg shadow p-6 space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                Features
              </h2>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>Clean, minimalist design with light gray background</li>
                <li>Search input with magnifying glass icon and ⌘F shortcut</li>
                <li>Notification and message icon buttons with badge counters</li>
                <li>User profile section with avatar, name, and email</li>
                <li>Fixed positioning at the top of the page</li>
                <li>Responsive design with proper spacing and alignment</li>
              </ul>
            </div>

            <div className="border-t pt-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                Last Search Query
              </h2>
              <p className="text-gray-600">
                {searchQuery || "No search query yet"}
              </p>
            </div>

            <div className="border-t pt-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                Interactive Features
              </h2>
              <div className="space-y-3">
                <button
                  onClick={() =>
                    setNotificationCount(
                      notificationCount > 0 ? notificationCount - 1 : 5
                    )
                  }
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Toggle Notification Count ({notificationCount})
                </button>
                <button
                  onClick={() =>
                    setMessageCount(messageCount > 0 ? messageCount - 1 : 3)
                  }
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Toggle Message Count ({messageCount})
                </button>
              </div>
            </div>

            <div className="border-t pt-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                Component Props
              </h2>
              <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto">
                {JSON.stringify(
                  {
                    userName: "Totok Michael",
                    userEmail: "tmichael@gmail.com",
                    notificationCount,
                    messageCount,
                  },
                  null,
                  2
                )}
              </pre>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default NavigationDemo;
