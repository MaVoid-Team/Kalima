# WhatsApp & WebSocket Integration Flow Documentation

This document outlines the architecture and event-driven flows for the WhatsApp service integration in the Kalima Admin Platform.

## 1. WebSocket Infrastructure (`socket.js`)

The platform uses `socket.io-client` for real-time communication between the admin dashboard and the backend.

### Connection Logic
- **URL Resolution**: The socket URL is derived from `VITE_API_URL`, transforming `https` to `wss` and removing API versioning paths.
- **Authentication**: Uses the `accessToken` from `localStorage`. It is sent in the `Authorization` header during the handshake.
- **Auto-Connection**: Managed via the `connectSocket()` helper, which ensures headers are up-to-date before initiating a connection.

---

## 2. WhatsApp Status Hook (`useWhatsappStatus.js`)

This hook centralizes the state and event listeners for the WhatsApp service.

### State Variables
- `status`: Current state of the WhatsApp client (`disconnected`, `qr_pending`, `ready`, `failed`).
- `qrCodeStr`: The raw string used to generate the QR code image.
- `sendingNumber`: The phone number currently linked as the sender.
- `loading`: Initial loading state while fetching status from the API.

---

## 3. Communication Flows

### A. Initial Hydration
1. Component mounts and calls `useWhatsappStatus()`.
2. Hook triggers `fetchStatus()` (GET `/admin/whatsapp/status`).
3. Hook establishes WebSocket listeners.
4. Hook calls `connectSocket()`.

### B. Device Linking (QR Flow)
1. **Trigger**: Admin clicks "Connect WhatsApp" (`requestQR()`).
2. **Action**: Frontend emits `requestWhatsappQr` via socket.
3. **QR Reception**: Backend emits `whatsappQr`.
    - Hook updates `status` to `qr_pending` and sets `qrCodeStr`.
    - Frontend renders QR code using `<QRCodeSVG />`.
4. **Authentication**: Admin scans QR code with their phone.
5. **Success**: Backend emits `whatsappAuthenticated`.
    - Hook updates `status` to `ready`.
    - Hook sets `sendingNumber`.
    - Displays success toast.

### C. Session Management & Disconnects
1. **Manual Logout**: Admin clicks "Logout" (`logout()`).
    - Frontend sends `POST /admin/whatsapp/logout`.
    - Hook resets state to `disconnected`.
2. **Server-Side Disconnect**: Backend emits `whatsappDisconnected`.
    - Hook resets state and displays a warning toast (unless it was a deliberate logout).
3. **Auth Failure**: Backend emits `whatsappAuthFailed`.
    - Hook updates `status` to `failed` and displays an error toast.

### D. Messaging Flow (REST)
1. **Trigger**: Admin confirms message in `OrderDetailPage` dialog.
2. **Action**: Frontend calls `sendMessage(message, phone)`.
3. **Request**: Sends `POST /admin/whatsapp/send`.
4. **Validation**: The backend uses the currently active Baileys session to send the text.
5. **Response**: Success/Failure toast is shown to the admin.

---

## 4. Socket Event Reference

| Event Name | Type | Direction | Payload | Description |
| :--- | :--- | :--- | :--- | :--- |
| `join` | Socket | Outgoing | `'store_admins'` | Joins the administrative room upon connection. |
| `requestWhatsappQr` | Socket | Outgoing | N/A | Requests the backend to initialize a WhatsApp session and generate a QR. |
| `whatsappQr` | Socket | Incoming | `{ qr: string }` | Provides the string to be rendered as a QR code. |
| `whatsappAuthenticated` | Socket | Incoming | `{ whatsapp_sending_number: string }` | Confirms successful device linking. |
| `whatsappAuthFailed` | Socket | Incoming | `{ reason: string }` | Reports an error during the authentication process. |
| `whatsappDisconnected` | Socket | Incoming | `{ reason: string }` | Reports that the WhatsApp session has been terminated. |
| `whatsapp:send` | Socket | Outgoing | `{ message, phone }` | *Legacy/Internal alternative* to the REST API for sending messages. |

---

## 5. UI Implementation Notes
- **Languge Support**: All toasts and status messages are piped through `i18next` (`admin` namespace).
- **Security**: The WebSocket connection is killed on hook unmount (`disconnectSocket`) to prevent resource leaks.
- **Directionality**: Phone numbers are forced to `ltr` to ensure correct display in Arabic RTL layouts.
