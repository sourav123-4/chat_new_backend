# 🔌 Socket.IO Events - Complete Reference

## Quick Start - Connection

```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:8000', {
  auth: { token: 'your-jwt-token' }
});

socket.on('connect', () => {
  console.log('Connected to server');
});

socket.on('connect_error', (error) => {
  console.error('Connection error:', error);
});
```

---

## 👥 User Status Events

### user_online
**Direction:** Server → Client
**When:** User comes online (first socket connection)

```javascript
socket.on('user_online', ({ userId }) => {
  // userId: string - ID of user who came online
  console.log(`${userId} is now online`);
  updateUserUI(userId, { isOnline: true });
});
```

### user_offline
**Direction:** Server → Client
**When:** User goes offline (last socket disconnection)

```javascript
socket.on('user_offline', ({ userId, lastSeen }) => {
  // userId: string - ID of user who went offline
  // lastSeen: number - Unix timestamp (milliseconds)
  console.log(`${userId} went offline. Last seen: ${new Date(lastSeen)}`);
  updateUserUI(userId, { isOnline: false, lastSeen });
});
```

---

## 💬 Message Events

### send_message
**Direction:** Client → Server
**When:** You want to send a message

```javascript
socket.emit('send_message', {
  conversationId: 'conv_123',      // Required: string
  text: 'Hello!',                  // Optional: string
  messageType: 'text',             // Optional: 'text'|'image'|'video'|'audio'|'file'
  file: {                          // Optional: for file messages
    url: 'https://example.com/file.jpg',
    type: 'image',                 // 'image'|'video'|'file'
    name: 'photo.jpg',
    size: 102400
  }
});
```

### message_received
**Direction:** Server → Client
**When:** New message is received in conversation

```javascript
socket.on('message_received', (message) => {
  // message object:
  // {
  //   _id: string,
  //   conversationId: string,
  //   senderId: string,
  //   text: string,
  //   file: { url, type, name, size } | null,
  //   messageType: 'text'|'image'|'video'|'audio'|'file',
  //   status: 'sent'|'delivered'|'read',
  //   readBy: string[],
  //   createdAt: ISO8601 string
  // }
  console.log('New message:', message);
  addMessageToChat(message);
});
```

### message_delivered
**Direction:** Server → Client
**When:** Message is delivered (receiver is online)

```javascript
socket.on('message_delivered', ({ messageId, conversationId }) => {
  // messageId: string - ID of message that was delivered
  // conversationId: string - ID of conversation
  console.log(`Message ${messageId} delivered`);
  updateMessageStatus(messageId, 'delivered');
});
```

### message_read (Send)
**Direction:** Client → Server
**When:** You want to mark a message as read

```javascript
socket.emit('message_read', {
  messageId: 'msg_456',            // Required: string
  conversationId: 'conv_123'       // Required: string
});
```

### message_read (Receive)
**Direction:** Server → Client
**When:** Someone reads a message

```javascript
socket.on('message_read', ({ messageId, userId }) => {
  // messageId: string - ID of message that was read
  // userId: string - ID of user who read it
  console.log(`User ${userId} read message ${messageId}`);
  updateMessageStatus(messageId, 'read');
});
```

---

## 📖 Conversation Events

### join_conversation
**Direction:** Client → Server
**When:** You open a chat conversation

```javascript
socket.emit('join_conversation', conversationId);
// conversationId: string - ID of the conversation to join

// All unread messages in this conversation will be marked as read automatically
```

### messages_read_bulk
**Direction:** Server → Client
**When:** You join a conversation with unread messages

```javascript
socket.on('messages_read_bulk', ({ conversationId, readerId }) => {
  // conversationId: string - ID of conversation
  // readerId: string - ID of user who read the messages
  console.log(`All messages in ${conversationId} marked as read`);
  markAllMessagesAsRead(conversationId);
});
```

---

## ⌨️ Typing Indicators

### typing
**Direction:** Client → Server
**When:** User starts typing

```javascript
socket.emit('typing', {
  conversationId: 'conv_123'       // Required: string
});
```

### typing (Receive)
**Direction:** Server → Client
**When:** Someone is typing

```javascript
socket.on('typing', ({ userId, conversationId }) => {
  // userId: string - ID of user typing
  // conversationId: string - ID of conversation
  console.log(`${userId} is typing...`);
  showTypingIndicator(userId, conversationId);
});
```

### stop_typing
**Direction:** Client → Server
**When:** User stops typing

```javascript
socket.emit('stop_typing', {
  conversationId: 'conv_123'       // Required: string
});
```

### stop_typing (Receive)
**Direction:** Server → Client
**When:** Someone stops typing

```javascript
socket.on('stop_typing', ({ userId, conversationId }) => {
  // userId: string - ID of user who stopped typing
  // conversationId: string - ID of conversation
  console.log(`${userId} stopped typing`);
  hideTypingIndicator(userId, conversationId);
});
```

---

## 🔄 Message Status Flow

```
User sends message
       ↓
    ↓ "sent" (initial status)
       ↓
Is receiver online?
    ↓                      ↓
   YES                     NO
    ↓                      ↓
"delivered" ────→ (waits for receiver)
    ↓                      ↓
    └─────→ "delivered" (when they come online)
            ↓
    User opens/reads message
            ↓
         "read"
```

---

## 🎯 Real-world Example - Chat Component

```javascript
import { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';

function ChatWindow({ conversationId, currentUserId, token }) {
  const [messages, setMessages] = useState([]);
  const [userTyping, setUserTyping] = useState(false);
  const [users, setUsers] = useState({});
  const socketRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Initialize socket connection
  useEffect(() => {
    const socket = io('http://localhost:8000', {
      auth: { token }
    });

    // Handle online/offline
    socket.on('user_online', ({ userId }) => {
      setUsers(prev => ({
        ...prev,
        [userId]: { ...prev[userId], isOnline: true }
      }));
    });

    socket.on('user_offline', ({ userId, lastSeen }) => {
      setUsers(prev => ({
        ...prev,
        [userId]: { ...prev[userId], isOnline: false, lastSeen }
      }));
    });

    // Join conversation
    socket.emit('join_conversation', conversationId);

    // Messages
    socket.on('message_received', (message) => {
      setMessages(prev => [...prev, message]);
    });

    socket.on('message_delivered', ({ messageId }) => {
      setMessages(prev =>
        prev.map(msg =>
          msg._id === messageId ? { ...msg, status: 'delivered' } : msg
        )
      );
    });

    socket.on('message_read', ({ messageId }) => {
      setMessages(prev =>
        prev.map(msg =>
          msg._id === messageId ? { ...msg, status: 'read' } : msg
        )
      );
    });

    // Typing indicators
    socket.on('typing', ({ userId }) => {
      setUserTyping(true);
    });

    socket.on('stop_typing', ({ userId }) => {
      setUserTyping(false);
    });

    socketRef.current = socket;
    return () => socket.close();
  }, [conversationId, token]);

  // Send message
  const handleSendMessage = (text) => {
    socketRef.current?.emit('send_message', {
      conversationId,
      text,
      messageType: 'text'
    });
  };

  // Mark message as read
  const handleMessageView = (messageId) => {
    socketRef.current?.emit('message_read', {
      messageId,
      conversationId
    });
  };

  // Typing
  const handleInputChange = () => {
    socketRef.current?.emit('typing', { conversationId });

    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socketRef.current?.emit('stop_typing', { conversationId });
    }, 3000);
  };

  return (
    <div>
      <div className="messages">
        {messages.map(msg => (
          <div
            key={msg._id}
            className="message"
            onView={() => handleMessageView(msg._id)}
          >
            <p>{msg.text}</p>
            <span className={`status ${msg.status}`}>
              {msg.status}
            </span>
          </div>
        ))}
      </div>

      {userTyping && <p className="typing-indicator">User is typing...</p>}

      <input
        type="text"
        onChange={handleInputChange}
        onKeyPress={e => {
          if (e.key === 'Enter') {
            handleSendMessage(e.target.value);
            e.target.value = '';
          }
        }}
        placeholder="Type a message..."
      />
    </div>
  );
}

export default ChatWindow;
```

---

## ⚠️ Common Mistakes

❌ **Don't:**
```javascript
// Forgetting to include token
const socket = io('http://localhost:8000');

// Emitting before socket is connected
socket.emit('send_message', data);

// Not handling disconnections
// (memory leaks and stale data)
```

✅ **Do:**
```javascript
// Include token in auth
const socket = io('http://localhost:8000', {
  auth: { token: 'your-jwt-token' }
});

// Wait for connection
socket.on('connect', () => {
  socket.emit('send_message', data);
});

// Clean up on unmount
useEffect(() => {
  return () => socket.close();
}, []);
```

---

## 🔗 Related Files

- **REST API Docs:** http://localhost:8000/api-docs
- **Swagger Guide:** `SWAGGER_GUIDE.md`
- **Socket Implementation:** `src/sockets/events.ts`
- **Socket State:** `src/sockets/state.ts`

---

**Last Updated:** March 28, 2026
