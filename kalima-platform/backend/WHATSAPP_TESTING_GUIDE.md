# Comprehensive WhatsApp Service Testing Guide

This document breaks down the flow of the new Kalima WhatsApp messaging service based on the backend architecture and provides step-by-step instructions for testing it.

## Architectural Analysis

The WhatsApp service is integrated using the Baileys library and spans multiple parts of the application:

1. **WebSockets (`src/libs/socket/setupStoreSocket.ts`)**: Handles the real-time asynchronous QR code generation and the initial connection/pairing process. It expects `requestWhatsappQr` and emits `whatsappQr` / `whatsappAuthenticated`.
2. **REST API Controller (`src/apps/store-api/controllers/whatsapp.controller.ts`)**: Handles messaging actions (`/whatsapp/send`), checking status (`/whatsapp/status`), and logging out (`/whatsapp/logout`).
3. **General Settings (`whatsapp.controller.ts`)**: Tracks the `whatsapp_sending_number` (automatically populated upon successful socket auth) and the `whatsapp_receiving_number` (manually set via `PUT /general-settings/whatsapp_receiving_number`).
4. **Authentication (`src/apps/store-api/routes/v2/admin.routes.ts`)**: All actions require an active Admin or SubAdmin Bearer Token.

---

## Step-by-Step Testing Process

### Step 1: Obtain an Admin Token

Both the Socket.IO connection and the REST API endpoints require a valid Admin or SubAdmin Token.

1. Log in to your Kalima application as an Admin.
2. Extract the token from your browser's Local Storage or Network tab (look for `Authorization: Bearer <token>`).

### Step 2: Establish Socket Connection and Link Device

Because the Kalima backend utilizes real-time streams to display the WhatsApp QR code, you must connect via Socket.IO first to pair your WhatsApp account.

**Using Postman:**

1. Open Postman, click **New**, and create a **WebSocket Request**.
2. Select **Socket.IO** from the protocol dropdown next to the URL.
3. Enter the URL: `ws://localhost:5000` (ensure your backend is running).
4. Go to the **Headers** tab and add:
   - **Key**: `Authorization`
   - **Value**: `Bearer <YOUR_ADMIN_TOKEN>`
5. Go to the **Events** tab and add listeners for:
   - `whatsappQr`
   - `whatsappAuthenticated`
6. Click **Connect**.
7. In the Message input area, set the Event Name to `requestWhatsappQr` and hit **Send**.
8. You will receive a `whatsappQr` event containing a long text string (e.g., `1@abcd...`).
9. Copy this exact string, paste it into a free online QR Code Generator (using Text mode), and scan the resulting QR code using **Linked Devices** on your physical WhatsApp mobile app.
10. Once scanned, Postman will receive a `whatsappAuthenticated` event, meaning your backend is successfully linked!

### Step 3: Test REST APIs (Messaging & Status)

Now that the backend is authenticated, you can use standard Postman HTTP requests (Ensure the `Authorization: Bearer <YOUR_ADMIN_TOKEN>` header is present for all requests).

#### A. Check Status

Verify the service recognizes your connected device.

- **Method**: `GET`
- **URL**: `http://localhost:3000/api/v2/admin/whatsapp/status`
- **Expected Output**:

```json
{
  "success": true,
  "data": {
    "status": "ready",
    "whatsapp_sending_number": "20100..."
  }
}
```

#### B. Verify Settings Synchronization

When you authenticated, the backend automatically saved your connected number to the general settings.

- **Method**: `GET`
- **URL**: `http://localhost:3000/api/v2/admin/general-settings`
- **Expected Output**: The `whatsapp_sending_number` should match your connected phone number.

#### C. Send a WhatsApp Message

Use the authenticated session to send a text message to any phone number.

- **Method**: `POST`
- **URL**: `http://localhost:3000/api/v2/admin/whatsapp/send`
- **Body** (Raw JSON):

```json
{
  "phone": "201012345678",
  "message": "Hello from Kalima Platform V2 Test!"
}
```

_(Note: Do not include the `+` sign in the phone number)._

- **Expected Output**:

```json
{
  "success": true,
  "message": "Message sent"
}
```

_(Check the recipient's phone to verify the message arrived!)_

#### D. Test Logout (Unlinking)

Clear the session and safely disconnect the device.

- **Method**: `POST`
- **URL**: `http://localhost:3000/api/v2/admin/whatsapp/logout`
- **Expected Output**:

```json
{
  "success": true,
  "message": "WhatsApp session cleared"
}
```

If you check `GET /api/v2/admin/whatsapp/status` again, the status should now be disconnected, and the `whatsapp_sending_number` in `general-settings` will be null.
