import { io } from "socket.io-client";
import { getToken } from "../routes/auth-services";

let socket = null;

export const initializeSocket = (userId) => {
  if (!userId) {
    console.error("Cannot initialize socket: Missing userId");
    return null;
  }

  if (socket?.connected) {
    return socket;
  }

  const token = getToken();
  if (!token) {
    console.error("Cannot initialize socket: No authentication token");
    return null;
  }

  // Close any existing socket before creating a new one
  if (socket) {
    socket.close();
    socket = null;
  }

  // Extract base URL without /api/v1
  const baseURL = import.meta.env.VITE_API_URL.replace('/api/v1', '');
  console.log("Initializing socket with URL:", baseURL);

  socket = io(baseURL, {
    auth: {
      token,
    },
    query: {
      userId,
    },
    path: "/socket.io",
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    timeout: 20000,
  });

  socket.on("connect", () => {
    console.log("Socket connected successfully with ID:", socket.id);
    socket.emit("subscribe", userId);
  });

  socket.on("connect_error", (error) => {
    console.error("Socket connection error:", error);
  });

  socket.on("disconnect", (reason) => {
    console.log("Socket disconnected:", reason);

    // Attempt to reconnect if it was server-initiated
    if (reason === "io server disconnect") {
      console.log("Server initiated disconnect, attempting to reconnect...");
      socket.connect();
    }
  });

  socket.on("error", (error) => {
    console.error("Socket error:", error);
  });

  socket.on("newHomework", (notification) => {
    console.log("Received homework notification:", notification);
  });

  socket.on("newLecture", (notification) => {
    console.log("Received lecture notification:", notification);
  });

  socket.on("newContainer", (notification) => {
    console.log("Received container notification:", notification);
  });

  socket.on("notification", (notification) => {
    console.log("Received general notification:", notification);
  });

  socket.on("newAttachment", (notification) => {
    console.log("Received attachment notification:", notification);
  });

  socket.on("lectureUpdate", (notification) => {
    console.log("Received lecture update notification:", notification);
  });

  socket.on("storePurchase", (notification) => {
    console.log("Received store purchase notification:", notification);
  });

  socket.on("bellAlert", (data) => {
    console.log("Received bell alert for new purchase:", data);
    playBellSound();
  });

  return socket;
};

// Function to play bell sound
const playBellSound = () => {
  try {
    // Create audio context for playing bell sound
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Simple bell tone - one frequency
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.type = "sine";

    // Quick attack, slow decay
    gainNode.gain.setValueAtTime(0.8, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1.5);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 1.5);
    console.log("Played simple bell sound");
  } catch (error) {
    console.error("Error playing bell sound:", error);

    playFallbackBeep();
  }
};

// Fallback beep function using simple audio generation
const playFallbackBeep = () => {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Simple tone
    oscillator.frequency.value = 800;
    oscillator.type = "sine";

    gainNode.gain.setValueAtTime(0.7, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1.2);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 1.2);
    console.log("Played simple fallback sound");
  } catch (error) {
    console.error("Error playing fallback beep:", error);
  }
};

// Expose playBellSound for manual testing in browser console
window.playBellSound = playBellSound;

export const getSocket = () => {
  if (!socket?.connected) {
    console.warn("Attempted to get socket, but none is connected");
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    console.log("Manually disconnecting socket");
    socket.disconnect();
    socket = null;
  }
};

export const forceReconnect = (userId) => {
  disconnectSocket();
  return initializeSocket(userId);
};
