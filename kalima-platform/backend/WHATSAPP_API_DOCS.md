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

### 2.3 Example Frontend React Component

```jsx
import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode.react'; // or your preferred library
import socket from './socket-client'; // your existing configured socket instance

const WhatsappConnect = () => {
  const [qrCodeStr, setQrCodeStr] = useState(null);
  const [status, setStatus] = useState("disconnected");
  const [number, setNumber] = useState(null);

  useEffect(() => {
    // Listen for QR code updates
    socket.on("whatsappQr", ({ qr }) => {
      setQrCodeStr(qr);
      setStatus("qr_pending");
    });

    // Listen for successful authentication
    socket.on("whatsappAuthenticated", ({ whatsapp_sending_number }) => {
      setStatus("ready");
      setNumber(whatsapp_sending_number);
      setQrCodeStr(null);
    });

    // Handle failures and disconnects
    socket.on("whatsappAuthFailed", () => setStatus("failed"));
    socket.on("whatsappDisconnected", () => {
      setStatus("disconnected");
      setNumber(null);
    });

    return () => {
      socket.off("whatsappQr");
      socket.off("whatsappAuthenticated");
      socket.off("whatsappAuthFailed");
      socket.off("whatsappDisconnected");
    };
  }, []);

  const requestQR = () => {
    socket.emit("requestWhatsappQr");
  };

  return (
    <div>
      <h2>WhatsApp Sending Number Status: {status}</h2>
      
      {status === "ready" && <p>Connected as: {number}</p>}
      
      {status === "disconnected" && (
        <button onClick={requestQR}>Connect WhatsApp</button>
      )}

      {status === "qr_pending" && qrCodeStr && (
        <div>
          <p>Please scan this QR code with your WhatsApp app (Linked Devices).</p>
          <QRCode value={qrCodeStr} size={256} />
        </div>
      )}
    </div>
  );
};

export default WhatsappConnect;
```
