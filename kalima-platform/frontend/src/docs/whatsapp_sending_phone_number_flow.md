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

---

# WhatsApp Service API Documentation & Frontend Guide

This documentation provides the details needed to integrate the newly created WhatsApp service into the admin frontend. The service uses a WebSocket approach for generating a QR code (to link the sending device) and exposes REST API endpoints for configuring the receiving number and sending text messages.

## 1. REST API Endpoints

All endpoints below require standard Admin/SubAdmin authentication headers (`Authorization: Bearer <token>`).

### 1.1 Get General Settings
Retrieve the currently configured WhatsApp sending and receiving numbers.

- **Endpoint**: `GET /api/v2/admin/general-settings`
- **Response**:
```json
{
  "success": true,
  "data": {
    "whatsapp_sending_number": "201000000000",
    "whatsapp_receiving_number": "201000000001"
  }
}
```

### 1.2 Update Receiving Number
Update the number used to receive messages (for display purposes).

- **Endpoint**: `PUT /api/v2/admin/general-settings/whatsapp_receiving_number`
- **Body**:
```json
{
  "whatsapp_receiving_number": "201000000001"
}
```
- **Response**:
```json
{
  "success": true,
  "message": "Receiving number updated",
  "data": {
    "whatsapp_receiving_number": "201000000001"
  }
}
```

### 1.3 Get WhatsApp Client Status
Check if the WhatsApp sender client is actively connected to the WhatsApp servers.

- **Endpoint**: `GET /api/v2/admin/whatsapp/status`
- **Response**:
```json
{
  "success": true,
  "data": {
    "status": "ready", // "disconnected" | "qr_pending" | "ready"
    "whatsapp_sending_number": "201000000000"
  }
}
```

### 1.4 Send WhatsApp Message
Send a WhatsApp text message using the linked sending device.

- **Endpoint**: `POST /api/v2/admin/whatsapp/send`
- **Body**:
```json
{
  "phone": "201000000000",
  "message": "Hello from Kalima!"
}
```
- **Response**:
```json
{
  "success": true,
  "message": "Message sent"
}
```
> **Note**: The API expects the phone number without a `+` sign.

### 1.5 Logout / Clear Session
Logout the linked device from the server, clearing the current session.

- **Endpoint**: `POST /api/v2/admin/whatsapp/logout`
- **Response**:
```json
{
  "success": true,
  "message": "WhatsApp session cleared"
}
```

---

## 2. Frontend Guide: Connecting via QR Code (Socket.io)

Since the `baileys` package uses WebSockets to connect to WhatsApp, generating the QR code happens asynchronously in real-time. We use Socket.io to push the generated QR code string directly to the admin dashboard.

### 2.1 Installing a QR Code Renderer on Frontend
The backend emits the raw QR code string. The frontend must convert this string into a visual QR code image.

```bash
# Example for React
npm install qrcode.react
```

### 2.2 Socket.io Flow
Ensure the frontend is connected to the backend via Socket.io in the `store_admins` namespace/room.

#### Flow Steps:
1. **Frontend**: Admin clicks "Connect WhatsApp" button.
2. **Frontend**: Emits `requestWhatsappQr` event.
   ```javascript
   socket.emit("requestWhatsappQr");
   ```
3. **Backend**: Will initialize Baileys and emit `whatsappQr` continuously (updates every ~30s).
   ```javascript
   socket.on("whatsappQr", (data) => {
     const { qr } = data;
     // qr is a raw string. Render it using a library:
     // <QRCode value={qr} size={256} />
   });
   ```
4. **Admin**: Scans the QR code with their mobile device (WhatsApp -> Linked Devices).
5. **Backend**: Emits `whatsappAuthenticated` upon success.
   ```javascript
   socket.on("whatsappAuthenticated", (data) => {
     const { status, whatsapp_sending_number } = data;
     if (status === "accepted") {
       console.log(`Connected with number: ${whatsapp_sending_number}`);
       // Hide QR code UI and display "Connected as [number]"
     }
   });
   ```
6. **Backend**: Can emit failures or disconnects.
   ```javascript
   socket.on("whatsappAuthFailed", (data) => {
     console.error("Auth failed:", data.reason);
   });

   socket.on("whatsappDisconnected", (data) => {
     console.warn("Disconnected:", data.reason);
     // Revert UI to disconnected state
   });
   ```
