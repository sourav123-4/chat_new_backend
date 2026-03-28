/**
 * @swagger
 * /socket-events:
 *   get:
 *     tags:
 *       - Socket Events
 *     summary: WebSocket Events Documentation
 *     description: |
 *       # Socket.IO Events for Real-time Chat
 *
 *       ## Connection
 *       - **Authentication**: Include JWT token in `auth.token`
 *       - **Connection Event**: `connection` (automatic on successful auth)
 *
 *       ## User Status Events
 *
 *       ### Client to Server:
 *       - None (automatic tracking)
 *
 *       ### Server to Client:
 *       - **user_online**: Emitted when a user comes online
 *         ```javascript
 *         socket.on('user_online', ({ userId }) => {
 *           // userId: string - ID of the user who came online
 *         });
 *         ```
 *
 *       - **user_offline**: Emitted when a user goes offline
 *         ```javascript
 *         socket.on('user_offline', ({ userId, lastSeen }) => {
 *           // userId: string - ID of the user who went offline
 *           // lastSeen: number - Unix timestamp of last activity
 *         });
 *         ```
 *
 *       ## Conversation Events
 *
 *       ### join_conversation
 *       Join a conversation and mark unread messages as read
 *       ```javascript
 *       socket.emit('join_conversation', conversationId);
 *       ```
 *       - **conversationId**: string - ID of the conversation
 *       - **Response**: `messages_read_bulk` event emitted if messages were marked read
 *
 *       ### messages_read_bulk
 *       Emitted when joining a conversation with unread messages
 *       ```javascript
 *       socket.on('messages_read_bulk', ({ conversationId, readerId }) => {
 *         // conversationId: string - ID of the conversation
 *         // readerId: string - ID of the user who read the messages
 *       });
 *       ```
 *
 *       ## Message Events
 *
 *       ### send_message
 *       Send a message in a conversation
 *       ```javascript
 *       socket.emit('send_message', {
 *         conversationId: string,
 *         text?: string,
 *         file?: {
 *           url: string,
 *           type: 'image' | 'video' | 'file',
 *           name: string,
 *           size: number
 *         },
 *         messageType: 'text' | 'image' | 'video' | 'audio' | 'file'
 *       });
 *       ```
 *
 *       ### message_received
 *       Emitted when a new message is received
 *       ```javascript
 *       socket.on('message_received', (message) => {
 *         // message: {
 *         //   _id: string,
 *         //   conversationId: string,
 *         //   senderId: string,
 *         //   text: string,
 *         //   file: object,
 *         //   messageType: string,
 *         //   status: 'sent' | 'delivered' | 'read',
 *         //   readBy: string[],
 *         //   createdAt: ISO8601
 *         // }
 *       });
 *       ```
 *
 *       ### message_delivered
 *       Emitted when a message is delivered to an online user
 *       ```javascript
 *       socket.on('message_delivered', ({ messageId, conversationId }) => {
 *         // messageId: string - ID of the message
 *         // conversationId: string - ID of the conversation
 *       });
 *       ```
 *
 *       ### message_read
 *       Mark a message as read
 *       ```javascript
 *       socket.emit('message_read', {
 *         messageId: string,
 *         conversationId: string
 *       });
 *       ```
 *
 *       ### message_read (receive)
 *       Emitted when a message is marked as read by someone
 *       ```javascript
 *       socket.on('message_read', ({ messageId, userId }) => {
 *         // messageId: string - ID of the message that was read
 *         // userId: string - ID of the user who read it
 *       });
 *       ```
 *
 *       ## Typing Indicators
 *
 *       ### typing
 *       Notify others that you're typing
 *       ```javascript
 *       socket.emit('typing', { conversationId });
 *       ```
 *       - **conversationId**: string - ID of the conversation
 *
 *       ### typing (receive)
 *       ```javascript
 *       socket.on('typing', ({ userId, conversationId }) => {
 *         // userId: string - ID of the user typing
 *         // conversationId: string - ID of the conversation
 *       });
 *       ```
 *
 *       ### stop_typing
 *       Notify others that you stopped typing
 *       ```javascript
 *       socket.emit('stop_typing', { conversationId });
 *       ```
 *
 *       ### stop_typing (receive)
 *       ```javascript
 *       socket.on('stop_typing', ({ userId, conversationId }) => {
 *         // userId: string - ID of the user who stopped typing
 *         // conversationId: string - ID of the conversation
 *       });
 *       ```
 *
 *       ## Message Status Flow
 *       - **sending**: Processing/uploading (optional)
 *       - **sent**: Message created and sent
 *       - **delivered**: Receiver is online (auto-updated)
 *       - **read**: User has viewed the message
 *
 *       ## Example Usage
 *
 *       ```javascript
 *       import io from 'socket.io-client';
 *
 *       const socket = io('http://localhost:8000', {
 *         auth: { token: 'your-jwt-token' }
 *       });
 *
 *       // Handle online/offline
 *       socket.on('user_online', ({ userId }) => {
 *         updateUserStatus(userId, true);
 *       });
 *
 *       socket.on('user_offline', ({ userId, lastSeen }) => {
 *         updateUserStatus(userId, false, lastSeen);
 *       });
 *
 *       // Join conversation
 *       socket.emit('join_conversation', conversationId);
 *
 *       // Send message
 *       socket.emit('send_message', {
 *         conversationId: 'conv123',
 *         text: 'Hello!',
 *         messageType: 'text'
 *       });
 *
 *       // Listen for messages
 *       socket.on('message_received', (message) => {
 *         addMessageToUI(message);
 *       });
 *
 *       // Mark as read
 *       socket.emit('message_read', { messageId, conversationId });
 *       ```
 *     responses:
 *       200:
 *         description: Socket events documentation (view in Swagger UI)
 */
