import React, { useEffect, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { FiBell, FiX, FiRefreshCw } from "react-icons/fi";
import {
  initializeSocket,
  getSocket,
  disconnectSocket,
  forceReconnect,
} from "../utils/socket";
import { getToken } from "../routes/auth-services";
import axios from "axios";

const NotificationCenter = ({ userId }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);
  const { t } = useTranslation();

  // Function to manually fetch unsent notifications
  const fetchUnsentNotifications = useCallback(async () => {
    if (!userId) {
      console.error("Cannot fetch notifications: No user ID");
      return;
    }

    setIsLoading(true);
    try {
      const token = getToken();
      console.log("Fetching unsent notifications for user:", userId);
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/v1/notifications/unsent`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Notification API response:", response.data);
      if (response.data.status === "success" && response.data.data.length > 0) {
        console.log("Received notifications:", response.data.data);
        setNotifications((prev) => {
          // Filter out duplicates
          const existingIds = new Set(prev.map((n) => n.notificationId));
          const newNotifications = response.data.data.filter(
            (n) => !existingIds.has(n.notificationId)
          );

          console.log(`Adding ${newNotifications.length} new notifications`);
          return [...newNotifications, ...prev];
        });
        setUnreadCount((prev) => prev + response.data.data.length);
      } else {
        console.log("No unsent notifications found");
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Function to manually reconnect socket
  const handleReconnect = useCallback(() => {
    console.log("Manual reconnection requested");
    const socket = forceReconnect(userId);
    if (socket) {
      setupSocketListeners(socket);
    }
    fetchUnsentNotifications();
  }, [userId, fetchUnsentNotifications]);

  // Setup socket event listeners
  const setupSocketListeners = useCallback((socket) => {
    if (!socket) return;

    // Check socket connection status
    if (socket.connected) {
      setSocketConnected(true);
    }

    socket.on("connect", () => {
      console.log("Socket connected in NotificationCenter");
      setSocketConnected(true);
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected in NotificationCenter");
      setSocketConnected(false);
    });

    // Custom socket event handlers
    const eventTypes = [
      "newHomework",
      "newLecture",
      "newContainer",
      "notification",
      "newAttachment",
      "lectureUpdate",
    ];

    // Remove existing listeners before adding new ones
    eventTypes.forEach((eventType) => {
      socket.off(eventType);
    });

    // Add new listeners
    eventTypes.forEach((eventType) => {
      socket.on(eventType, (notification) => {
        console.log(`NotificationCenter received ${eventType}:`, notification);
        // Add the new notification to the list, avoid duplicates
        setNotifications((prev) => {
          const exists = prev.some(
            (n) => n.notificationId === notification.notificationId
          );
          if (exists) return prev;
          return [notification, ...prev];
        });
        setUnreadCount((prev) => prev + 1);
      });
    });
  }, []);

  useEffect(() => {
    if (userId) {
      console.log("NotificationCenter initializing for user:", userId);

      // Initialize the socket
      const socket = initializeSocket(userId);

      if (!socket) {
        console.error("Failed to initialize socket in NotificationCenter");
        return;
      }

      // Setup event listeners
      setupSocketListeners(socket);

      // Try to fetch any unsent notifications
      fetchUnsentNotifications();

      // Clean up on unmount
      return () => {
        console.log("Cleaning up NotificationCenter for user:", userId);
        const currentSocket = getSocket();
        if (currentSocket) {
          [
            "newHomework",
            "newLecture",
            "newContainer",
            "notification",
            "newAttachment",
            "lectureUpdate",
          ].forEach((eventType) => currentSocket.off(eventType));
        }
      };
    }
  }, [userId, setupSocketListeners, fetchUnsentNotifications]);

  // Setup periodic ping to keep connection alive
  useEffect(() => {
    if (!userId) return;

    // Send periodic pings to keep the socket connection alive
    const pingInterval = setInterval(() => {
      const socket = getSocket();
      if (socket?.connected) {
        console.log("Sending ping to keep connection alive");
        socket.emit("ping");
      } else if (socket) {
        console.log("Socket disconnected, attempting to reconnect");
        handleReconnect();
      }
    }, 30000); // Every 30 seconds

    return () => {
      clearInterval(pingInterval);
    };
  }, [userId, handleReconnect]);

  const handleMarkAsRead = (notificationId) => {
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.notificationId === notificationId
          ? { ...notif, read: true }
          : notif
      )
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));

    // Optional: Mark as read on the server
    try {
      const token = getToken();
      axios.patch(
        `${
          import.meta.env.VITE_API_URL
        }/api/v1/notifications/${notificationId}/read`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  return (
    <div className="relative">
      <button
        className="btn btn-ghost btn-circle"
        onClick={toggleNotifications}
      >
        <div className="indicator">
          <FiBell className="h-6 w-6" />
          {unreadCount > 0 && (
            <span className="badge badge-sm badge-primary indicator-item">
              {unreadCount}
            </span>
          )}
        </div>
      </button>

      {showNotifications && (
        <div className="absolute right-0 mt-2 w-80 bg-base-100 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          <div className="flex justify-between items-center p-3 border-b">
            <div className="flex items-center">
              <h3 className="font-semibold">{t("notifications")}</h3>
              {!socketConnected && (
                <span
                  className="ml-2 w-2 h-2 rounded-full bg-red-500"
                  title="Disconnected"
                ></span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleReconnect}
                disabled={isLoading}
                className="btn btn-ghost btn-xs"
                title="Refresh notifications"
              >
                <FiRefreshCw
                  className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
                />
              </button>
              <button onClick={() => setShowNotifications(false)}>
                <FiX className="h-5 w-5" />
              </button>
            </div>
          </div>

          {isLoading && (
            <div className="p-4 text-center">
              <span className="loading loading-spinner loading-sm"></span>
            </div>
          )}

          {!isLoading && notifications.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              {t("noNotifications")}
            </div>
          ) : (
            <div>
              {notifications.map((notification, idx) => (
                <div
                  key={notification.notificationId || idx}
                  className={`p-3 border-b hover:bg-base-200 cursor-pointer ${
                    !notification.read ? "bg-base-200" : ""
                  }`}
                  onClick={() => handleMarkAsRead(notification.notificationId)}
                >
                  <div className="font-medium">{notification.title}</div>
                  <div className="text-sm">{notification.message}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {new Date(
                      notification.createdAt || new Date()
                    ).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;
