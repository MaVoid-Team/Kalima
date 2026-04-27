import { io } from 'socket.io-client';

const socketURL = import.meta.env.VITE_API_URL?.replace('/api/v2', '').replace('https', 'wss') || 'http://localhost:5000';
console.log('Socket URL initialized:', socketURL);

const socket = io(socketURL, {
    auth: {
        token: localStorage.getItem('accessToken')
    }
    // autoConnect: false,
    // transports: ['websocket'],
    // withCredentials: true,
});

// Update auth token before each connect attempt
socket.on('connect', () => {
    console.log('Socket connected to /store_admins');
});

socket.on('connect_error', (err) => {
    console.error('Socket connection error:', err.message);
});

socket.on('disconnect', (reason) => {
    console.log('Socket disconnected:', reason);
});

export const connectSocket = () => {
    const token = localStorage.getItem('accessToken');
    if (token) {
        // socket.auth = { token };
        // Fallback: some backends check query parameters
        socket.io.opts.headers = { Authorization: `Bearer ${token}` };
    } else {
        console.warn('No access token found for socket connection');
    }

    if (!socket.connected) {
        console.log('Attempting to connect to socket...');
        socket.connect();
    }
};

export const disconnectSocket = () => {
    socket.disconnect();
};

export default socket;
