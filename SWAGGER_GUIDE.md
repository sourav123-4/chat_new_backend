# ChatApp Backend - Swagger Integration Guide

## 📚 Overview
Swagger/OpenAPI documentation has been integrated for all REST API endpoints and WebSocket events.

## 🚀 Access Swagger UI
Once the server is running, visit:
```
http://localhost:8000/api-docs
```

## 📋 Available Endpoints

### Authentication (`/api/auth`)
- **POST /signup** - Register new user
- **POST /login** - Login with email/password
- **POST /google-signin** - Sign in with Google OAuth
- **POST /refresh-token** - Refresh JWT token
- **POST /forgot-password** - Request password reset
- **POST /verify-otp** - Verify OTP code
- **POST /reset-password** - Reset password
- **POST /verify-email** - Verify email address
- **GET /profile** - Get user profile (requires auth)
- **PUT /profile** - Update user profile (requires auth)
- **PUT /change-password** - Change password (requires auth)
- **DELETE /delete** - Delete account (requires auth)
- **POST /logout** - Logout (requires auth)
- **GET /search** - Search users (requires auth)
- **GET /all** - Get all users (requires auth)

### Chats (`/api/chats`)
- **POST /create** - Create new conversation (requires auth)
- **GET /list** - Get chat list with user status (requires auth)

### Messages (`/api/messages`)
- **POST /send** - Send message (requires auth, supports file upload)
- **GET /{conversationId}** - Get messages from conversation (requires auth)

### Notifications (`/api/notification`)
- **POST /send** - Send push notification

## 🔌 WebSocket Events

### Connection Setup
```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:8000', {
  auth: { token: 'your-jwt-token' }
});
```

### User Status Events

#### User Online
**Server → Client**
```javascript
socket.on('user_online', ({ userId }) => {
  console.log(`User ${userId} is now online`);
});
```

#### User Offline
**Server → Client**
```javascript
socket.on('user_offline', ({ userId, lastSeen }) => {
  console.log(`User ${userId} went offline at ${new Date(lastSeen)}`);
});
```

### Conversation Events

#### Join Conversation
**Client → Server**
```javascript
socket.emit('join_conversation', conversationId);
```

#### Messages Read Bulk
**Server → Client** (auto-emitted when joining a conversation)
```javascript
socket.on('messages_read_bulk', ({ conversationId, readerId }) => {
  console.log(`All messages in ${conversationId} marked as read`);
});
```

### Message Events

#### Send Message
**Client → Server**
```javascript
socket.emit('send_message', {
  conversationId: 'conv_id',
  text: 'Hello!',
  messageType: 'text'
  // Optional file for image/video/file messages
  // file: { url, type, name, size }
});
```

#### Message Received
**Server → Client**
```javascript
socket.on('message_received', (message) => {
  // message object with: _id, conversationId, senderId, text, 
  // file, messageType, status, readBy, createdAt
  console.log('New message:', message);
});
```

#### Message Delivered
**Server → Client** (auto-emitted when receiver is online)
```javascript
socket.on('message_delivered', ({ messageId, conversationId }) => {
  console.log(`Message ${messageId} delivered`);
});
```

#### Mark Message as Read
**Client → Server**
```javascript
socket.emit('message_read', {
  messageId: 'msg_id',
  conversationId: 'conv_id'
});
```

#### Message Read Confirmation
**Server → Client**
```javascript
socket.on('message_read', ({ messageId, userId }) => {
  console.log(`User ${userId} read message ${messageId}`);
});
```

### Typing Indicators

#### Start Typing
**Client → Server**
```javascript
socket.emit('typing', { conversationId });
```

#### Typing Indicator
**Server → Client**
```javascript
socket.on('typing', ({ userId, conversationId }) => {
  console.log(`User ${userId} is typing in ${conversationId}`);
});
```

#### Stop Typing
**Client → Server**
```javascript
socket.emit('stop_typing', { conversationId });
```

#### Stop Typing Indicator
**Server → Client**
```javascript
socket.on('stop_typing', ({ userId, conversationId }) => {
  console.log(`User ${userId} stopped typing in ${conversationId}`);
});
```

## 🔐 Authentication

### Getting JWT Token
1. Call `/api/auth/login` or `/api/auth/signup`
2. Receive `token` in response
3. Include in all authenticated requests:
   ```javascript
   // REST API
   headers: {
     'Authorization': 'Bearer YOUR_TOKEN'
   }
   
   // WebSocket
   socket = io(url, {
     auth: { token: 'YOUR_TOKEN' }
   });
   ```

## 📦 Message Status Lifecycle
```
sending → sent → delivered → read
```

- **sending**: Processing/uploading (if file)
- **sent**: Message created and transmitted
- **delivered**: Receiver is online (auto-updated)
- **read**: User has viewed the message

## 📱 Frontend Integration Example

### React Implementation
```javascript
import { useState, useEffect } from 'react';
import io from 'socket.io-client';

function ChatApp() {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [typing, setTyping] = useState(false);

  useEffect(() => {
    const newSocket = io('http://localhost:8000', {
      auth: { token: localStorage.getItem('token') }
    });

    // User status
    newSocket.on('user_online', ({ userId }) => {
      updateUserStatus(userId, true);
    });

    newSocket.on('user_offline', ({ userId, lastSeen }) => {
      updateUserStatus(userId, false, lastSeen);
    });

    // Messages
    newSocket.on('message_received', (message) => {
      setMessages(prev => [...prev, message]);
    });

    newSocket.on('message_delivered', ({ messageId }) => {
      setMessages(prev => 
        prev.map(msg => 
          msg._id === messageId ? { ...msg, status: 'delivered' } : msg
        )
      );
    });

    newSocket.on('message_read', ({ messageId }) => {
      setMessages(prev => 
        prev.map(msg => 
          msg._id === messageId ? { ...msg, status: 'read' } : msg
        )
      );
    });

    // Typing indicators
    newSocket.on('typing', ({ userId }) => {
      setTyping(true);
    });

    newSocket.on('stop_typing', ({ userId }) => {
      setTyping(false);
    });

    setSocket(newSocket);
    return () => newSocket.close();
  }, []);

  const sendMessage = (text, conversationId) => {
    if (socket) {
      socket.emit('send_message', {
        conversationId,
        text,
        messageType: 'text'
      });
    }
  };

  const markAsRead = (messageId, conversationId) => {
    if (socket) {
      socket.emit('message_read', { messageId, conversationId });
    }
  };

  const startTyping = (conversationId) => {
    if (socket) {
      socket.emit('typing', { conversationId });
    }
  };

  const stopTyping = (conversationId) => {
    if (socket) {
      socket.emit('stop_typing', { conversationId });
    }
  };

  return (
    <div>
      {/* Your UI here */}
    </div>
  );
}

export default ChatApp;
```

## 🐛 Troubleshooting

### WebSocket Connection Issues
- Ensure JWT token is valid
- Check CORS settings in server
- Verify socket is connected before emitting

### Messages Not Delivered
- Check if receiver is online (check `message_delivered` event)
- Verify conversation ID is correct
- Check database connection

### Authentication Failures
- Verify JWT token hasn't expired
- Check token format: `Bearer <token>`
- Confirm token is included in socket `auth` option

## 📝 Testing with cURL

### Signup
```bash
curl -X POST http://localhost:8000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "SecurePass123!"
  }'
```

### Login
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123!"
  }'
```

### Get Chat List (with token)
```bash
curl -X GET http://localhost:8000/api/chats/list \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🔄 Real-time Features

✅ Real-time messaging
✅ Online/offline status
✅ Message delivery status
✅ Read receipts
✅ Typing indicators
✅ Multi-device support
✅ Automatic pending message delivery

## 📞 Support
For issues or questions, check:
- Swagger UI at `/api-docs`
- Server logs for detailed error messages
- WebSocket connection in browser DevTools

---

**Last Updated**: March 28, 2026
**Version**: 1.0.0
