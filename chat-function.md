# WhatsApp-Style Chat System Integration
## Technical Specification for School Assessment System

**Project:** School Assessment & CSR Management System  
**Module:** Real-Time Chat Feature  
**Version:** 1.0  
**Date:** February 13, 2026  
**Architecture:** Node.js + Express + PostgreSQL + Socket.IO + Next.js 14

---

## Executive Summary

This document specifies the integration of a WhatsApp-inspired real-time chat system into the existing School Assessment Management System. The chat enables instant communication between admins and employees for coordination, support, and collaboration on school visits and CSR initiatives[1][2].

**Core Capabilities:**
- Real-time one-on-one messaging between admins and employees
- Group chats for team coordination
- Message delivery status (sent, delivered, read)
- Typing indicators
- File and image sharing
- Message search and history
- Unread message badges
- Push notifications (browser)
- Mobile-responsive WhatsApp-like UI

**Integration Benefits:**
- Instant communication for urgent school visit queries
- Quick clarification on requirements documentation
- Team coordination for multi-school initiatives
- Support channel for field employees
- File sharing for visit photos and documents
- Centralized communication within existing platform

**Technology Stack:**
- **Backend:** Socket.IO for WebSocket connections[3]
- **Frontend:** Socket.IO client with React hooks
- **Database:** PostgreSQL for message persistence
- **Real-time:** WebSocket bidirectional communication[1]
- **Infrastructure:** Existing GCP e2-micro VM (no additional cost)

---

## Table of Contents

1. Feature Specifications
2. Architecture & Real-Time Communication
3. Database Schema Design
4. API Endpoints
5. Socket.IO Events
6. Frontend Components
7. Integration with Existing System
8. Implementation Roadmap
9. Security Considerations
10. Cost Impact Analysis

---

## 1. Feature Specifications

### 1.1 Chat Types

**One-on-One Chat**
- Direct messaging between any admin and employee
- Private conversation threads
- Chat list shows all active conversations
- Last message preview in chat list
- Unread message count badge

**Group Chat**
- Admins can create groups
- Add/remove members (admin only)
- Group name and description
- Member list display
- Group info page
- Leave group functionality

### 1.2 Messaging Features

**Text Messages**
- Plain text messaging (up to 5,000 characters)
- Multi-line message support
- Emoji support (native browser emojis)
- URL auto-detection and linkification
- Timestamp display (12-hour format)
- Message editing (within 15 minutes)
- Message deletion (for self and for everyone)

**File Sharing**
- Image sharing (JPEG, PNG, WebP, max 10MB)
- Document sharing (PDF, DOCX, XLSX, max 25MB)
- Reuse existing GCP Cloud Storage integration
- Thumbnail generation for images
- File download functionality
- Preview images inline

**Rich Features**
- Reply to specific messages (quoted reply)
- Forward messages to other chats
- Copy message text
- Message reactions (👍 ❤️ 😂 😮 😢 🙏)
- Voice messages (Phase 2 - future)

### 1.3 Real-Time Indicators

**Typing Indicator**
- Show "User is typing..." when other user types
- Display for 3 seconds after last keystroke
- Multiple users typing: "User1, User2 are typing..."

**Online Status**
- Green dot for online users
- Last seen timestamp for offline users
- "Online" label in chat header

**Message Status**
- ✓ Sent (message delivered to server)
- ✓✓ Delivered (message delivered to recipient)
- ✓✓ Read (message read by recipient - blue checkmarks)
- Real-time status updates via Socket.IO

### 1.4 Message Organization

**Chat List**
- Sorted by most recent message
- Pin important chats to top
- Archive inactive chats
- Delete chat (hides conversation)
- Search chats by name
- Filter: All / Unread / Groups

**Message Search**
- Search within specific chat
- Global search across all chats
- Search by sender, date range
- Jump to searched message in conversation

**Message History**
- Infinite scroll pagination (load 50 messages at a time)
- Load older messages on scroll up
- Maintain scroll position
- Date separators (Today, Yesterday, specific dates)

### 1.5 Notifications

**Browser Notifications**
- Desktop notification on new message (when browser tab inactive)
- Sound notification (toggle in settings)
- Notification preview: sender name + message snippet
- Click notification to open chat

**In-App Notifications**
- Unread badge count on chat icon in navbar
- Red badge on chat list items
- Bold text for unread messages

### 1.6 UI/UX Design (WhatsApp-Like)

**Layout**
- Left sidebar: Chat list (30% width)
- Right main area: Active chat conversation (70% width)
- Mobile: Stack layout (chat list → conversation)

**Chat List Item**
- User/group avatar (circular)
- Name (bold if unread)
- Last message preview (truncated)
- Timestamp (relative: "5m ago", "Yesterday")
- Unread count badge (green circle)
- Pin icon for pinned chats

**Chat Conversation**
- Header: User/group name, online status, actions
- Message area: Scrollable message list
- Input area: Text input + file upload + send button
- Message bubbles: Outgoing (right, blue) / Incoming (left, gray)
- Timestamps below each message
- Status checkmarks on outgoing messages

**Responsive Design**
- Mobile: Full-screen chat when conversation active
- Back button to return to chat list
- Touch-optimized message actions (long-press)
- Swipe gestures (swipe right to reply)

---

## 2. Architecture & Real-Time Communication

### 2.1 WebSocket Architecture

**Why Socket.IO?**
- Built on WebSockets with automatic fallback to HTTP long-polling[3]
- Handles connection drops and reconnection automatically
- Room/namespace support for group chats
- Event-based communication model
- Built-in broadcast capabilities[2]
- Cross-browser compatibility

**Connection Flow:**

┌─────────────┐                    ┌──────────────────┐
│   Client    │                    │   Server (VM)    │
│  (Browser)  │                    │  Socket.IO       │
└──────┬──────┘                    └────────┬─────────┘
       │                                    │
       │  1. HTTP Handshake (Upgrade)      │
       ├──────────────────────────────────>│
       │                                    │
       │  2. WebSocket Connection          │
       │<──────────────────────────────────┤
       │                                    │
       │  3. Authenticate (JWT in query)   │
       ├──────────────────────────────────>│
       │                                    │
       │  4. Join user-specific room       │
       │<──────────────────────────────────┤
       │                                    │
       │  5. Bidirectional Events          │
       │<─────────────────────────────────>│
       │   (messages, typing, status)      │
       │                                    │

### 2.2 System Architecture

┌──────────────────────────────────────────────────────────────┐
│              GCP e2-micro VM (Existing)                      │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  Node.js/Express Backend (Port 5000)                   │  │
│  │                                                        │  │
│  │  ┌──────────────────────────────────────────────────┐ │  │
│  │  │  Socket.IO Server                                │ │  │
│  │  │  - Connection management                         │ │  │
│  │  │  - Event handling                                │ │  │
│  │  │  - Room management (user rooms, chat rooms)      │ │  │
│  │  │  - Message broadcasting                          │ │  │
│  │  └──────────────────────────────────────────────────┘ │  │
│  │                                                        │  │
│  │  ┌──────────────────────────────────────────────────┐ │  │
│  │  │  REST API (Existing + Chat endpoints)            │ │  │
│  │  │  - Chat CRUD                                     │ │  │
│  │  │  - Message history                               │ │  │
│  │  │  - File upload                                   │ │  │
│  │  └──────────────────────────────────────────────────┘ │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  Next.js Frontend (Port 3000)                          │  │
│  │                                                        │  │
│  │  ┌──────────────────────────────────────────────────┐ │  │
│  │  │  Socket.IO Client                                │ │  │
│  │  │  - Auto-reconnect                                │ │  │
│  │  │  - Event listeners                               │ │  │
│  │  │  - React hooks integration                       │ │  │
│  │  └──────────────────────────────────────────────────┘ │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  PostgreSQL 15 (Port 5432)                             │  │
│  │  - Chats, Messages, MessageStatus tables              │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
                         │
                         │ HTTPS
                         ▼
┌──────────────────────────────────────────────────────────────┐
│         GCP Cloud Storage (Existing Bucket)                  │
│         - Chat images: chat-images/ folder                   │
│         - Chat files: chat-files/ folder                     │
└──────────────────────────────────────────────────────────────┘

### 2.3 Connection Management

**Connection Lifecycle:**

1. **Client connects** with JWT token in query string
2. **Server authenticates** user from token
3. **Server creates** user-specific room (`user-${userId}`)
4. **Server stores** socket mapping in memory (userId → socketId)
5. **Server joins** user to all chat rooms they participate in
6. **Client sends/receives** events via Socket.IO
7. **On disconnect**, server cleans up socket mapping

**Reconnection Strategy:**
- Automatic reconnection with exponential backoff
- Resume from last known message (using message ID)
- Re-fetch unread count on reconnect
- Sync message status on reconnect

### 2.4 Message Delivery Flow

**Sending a Message:**

User A                 Server              PostgreSQL        User B
  │                      │                      │              │
  │ 1. sendMessage       │                      │              │
  ├─────────────────────>│                      │              │
  │                      │                      │              │
  │                      │ 2. Save to DB        │              │
  │                      ├─────────────────────>│              │
  │                      │                      │              │
  │                      │ 3. Message saved     │              │
  │                      │<─────────────────────┤              │
  │                      │                      │              │
  │ 4. messageSent (ack) │                      │              │
  │<─────────────────────┤                      │              │
  │                      │                      │              │
  │                      │ 5. Emit to User B    │              │
  │                      ├─────────────────────────────────────>│
  │                      │   newMessage event   │              │
  │                      │                      │              │
  │                      │ 6. messageDelivered  │              │
  │                      │<─────────────────────────────────────┤
  │                      │                      │              │
  │ 7. messageDelivered  │                      │              │
  │<─────────────────────┤                      │              │

**Reading Messages:**

User B                 Server              PostgreSQL
  │                      │                      │
  │ 1. messageRead       │                      │
  ├─────────────────────>│                      │
  │                      │                      │
  │                      │ 2. Update status     │
  │                      ├─────────────────────>│
  │                      │                      │
  │                      │ 3. Emit to User A    │
  │                      │   (sender)           │
  │                      ├────────────────────> User A
  │                      │   messageRead event  │

---

## 3. Database Schema Design

### 3.1 Entity Relationship Diagram

┌──────────────┐       ┌──────────────────┐       ┌─────────────────┐
│    Chats     │       │    Messages      │       │  ChatParticipants│
├──────────────┤       ├──────────────────┤       ├─────────────────┤
│ id (PK)      │───┐   │ id (PK)          │   ┌──│ id (PK)         │
│ type (enum)  │   │   │ chat_id (FK)     │   │  │ chat_id (FK)    │
│ name         │   └──>│ sender_id (FK)   │   │  │ user_id (FK)    │
│ is_group     │       │ content          │   │  │ role            │
│ created_by   │       │ message_type     │   │  │ joined_at       │
│ created_at   │       │ file_url         │   │  │ left_at         │
│ updated_at   │       │ file_name        │   │  └─────────────────┘
└──────────────┘       │ file_size        │   │
       │               │ reply_to (FK)    │   │
       │               │ is_edited        │   │
       │               │ is_deleted       │   │
       │               │ deleted_at       │   │
       │               │ created_at       │   │
       │               └──────────────────┘   │
       │                      │               │
       └──────────────────────┴───────────────┘
                              │
                              ▼
                   ┌──────────────────┐
                   │  MessageStatus   │
                   ├──────────────────┤
                   │ id (PK)          │
                   │ message_id (FK)  │
                   │ user_id (FK)     │
                   │ status (enum)    │
                   │ delivered_at     │
                   │ read_at          │
                   └──────────────────┘

### 3.2 Prisma Schema

// prisma/schema.prisma - ADD TO EXISTING SCHEMA

enum ChatType {
  ONE_ON_ONE
  GROUP
}

enum MessageType {
  TEXT
  IMAGE
  FILE
}

enum MessageStatus {
  SENT
  DELIVERED
  READ
}

enum ParticipantRole {
  ADMIN
  MEMBER
}

model Chat {
  id            String      @id @default(uuid())
  type          ChatType    @default(ONE_ON_ONE)
  name          String?     // For group chats
  isGroup       Boolean     @default(false)
  createdById   String
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt
  
  // Relations
  createdBy     User        @relation("ChatCreatedBy", fields: [createdById], references: [id])
  participants  ChatParticipant[]
  messages      Message[]
  
  @@map("chats")
  @@index([type])
  @@index([isGroup])
}

model ChatParticipant {
  id            String          @id @default(uuid())
  chatId        String
  userId        String
  role          ParticipantRole @default(MEMBER)
  joinedAt      DateTime        @default(now())
  leftAt        DateTime?
  
  // Last read tracking
  lastReadMessageId String?
  lastReadAt        DateTime?
  
  // Relations
  chat          Chat        @relation(fields: [chatId], references: [id], onDelete: Cascade)
  user          User        @relation("ChatParticipants", fields: [userId], references: [id], onDelete: Cascade)
  
  @@map("chat_participants")
  @@unique([chatId, userId])
  @@index([chatId])
  @@index([userId])
}

model Message {
  id            String      @id @default(uuid())
  chatId        String
  senderId      String
  content       String?     @db.Text
  messageType   MessageType @default(TEXT)
  
  // File attachments
  fileUrl       String?
  fileName      String?
  fileSize      Int?        // in bytes
  
  // Reply functionality
  replyToId     String?
  
  // Edit/Delete tracking
  isEdited      Boolean     @default(false)
  isDeleted     Boolean     @default(false)
  deletedAt     DateTime?
  
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt
  
  // Relations
  chat          Chat        @relation(fields: [chatId], references: [id], onDelete: Cascade)
  sender        User        @relation("MessagesSent", fields: [senderId], references: [id])
  replyTo       Message?    @relation("MessageReplies", fields: [replyToId], references: [id], onDelete: SetNull)
  replies       Message[]   @relation("MessageReplies")
  statuses      MessageStatus[]
  reactions     MessageReaction[]
  
  @@map("messages")
  @@index([chatId])
  @@index([senderId])
  @@index([createdAt])
}

model MessageStatus {
  id            String      @id @default(uuid())
  messageId     String
  userId        String      // Recipient user
  status        MessageStatus @default(SENT)
  deliveredAt   DateTime?
  readAt        DateTime?
  
  // Relations
  message       Message     @relation(fields: [messageId], references: [id], onDelete: Cascade)
  user          User        @relation("MessageStatuses", fields: [userId], references: [id])
  
  @@map("message_statuses")
  @@unique([messageId, userId])
  @@index([messageId])
  @@index([userId])
  @@index([status])
}

model MessageReaction {
  id            String      @id @default(uuid())
  messageId     String
  userId        String
  emoji         String      // Unicode emoji
  createdAt     DateTime    @default(now())
  
  // Relations
  message       Message     @relation(fields: [messageId], references: [id], onDelete: Cascade)
  user          User        @relation("MessageReactions", fields: [userId], references: [id])
  
  @@map("message_reactions")
  @@unique([messageId, userId, emoji])
  @@index([messageId])
}

// Update existing User model to add chat relations
model User {
  // ... existing fields ...
  
  // Chat relations
  chatsCreated      Chat[]              @relation("ChatCreatedBy")
  chatParticipants  ChatParticipant[]   @relation("ChatParticipants")
  messagesSent      Message[]           @relation("MessagesSent")
  messageStatuses   MessageStatus[]     @relation("MessageStatuses")
  messageReactions  MessageReaction[]   @relation("MessageReactions")
}

### 3.3 Key Design Decisions

**Chat Participants Table:**
- Tracks who is in each chat
- Supports adding/removing members in group chats
- `leftAt` field for tracking when user left group
- `lastReadMessageId` for unread count calculation

**Message Status Table:**
- Separate row for each recipient's status
- One-on-one chat: 1 status row per message
- Group chat: N status rows per message (N = participant count)
- Enables per-user delivery and read tracking

**Message Soft Delete:**
- `isDeleted` flag instead of hard delete
- Preserves conversation flow
- "This message was deleted" placeholder in UI
- Permanent deletion via cron job after 30 days

---

## 4. API Endpoints

### 4.1 Chat Management

GET    /api/chats                    # Get all chats for current user
POST   /api/chats                    # Create new chat (one-on-one or group)
GET    /api/chats/:id                # Get chat details
PUT    /api/chats/:id                # Update chat (name, settings)
DELETE /api/chats/:id                # Delete/leave chat

### 4.2 Participants

GET    /api/chats/:id/participants   # Get chat members
POST   /api/chats/:id/participants   # Add member to group (admin only)
DELETE /api/chats/:id/participants/:userId  # Remove member (admin only)

### 4.3 Messages

GET    /api/chats/:id/messages       # Get message history (paginated)
POST   /api/chats/:id/messages       # Send message (also emits Socket event)
PUT    /api/messages/:id             # Edit message
DELETE /api/messages/:id             # Delete message
POST   /api/messages/:id/reactions   # Add reaction to message

### 4.4 Message Status

PUT    /api/messages/:id/read        # Mark message as read
GET    /api/chats/:id/unread         # Get unread count for chat

### 4.5 File Upload

POST   /api/chats/:id/upload         # Upload file/image for chat

### 4.6 Search

GET    /api/chats/search?q=query     # Search across all chats
GET    /api/chats/:id/search?q=query # Search within specific chat

### 4.7 API Response Examples

**Get Chats:**

GET /api/chats

{
  "success": true,
  "data": {
    "chats": [
      {
        "id": "chat-uuid",
        "type": "ONE_ON_ONE",
        "isGroup": false,
        "participants": [
          {
            "id": "user-uuid",
            "name": "Priya Sharma",
            "role": "EMPLOYEE",
            "isOnline": true,
            "lastSeen": null
          }
        ],
        "lastMessage": {
          "id": "msg-uuid",
          "content": "I'll visit ABC School tomorrow",
          "sender": {
            "id": "user-uuid",
            "name": "Priya Sharma"
          },
          "createdAt": "2026-02-13T10:30:00Z"
        },
        "unreadCount": 2,
        "isPinned": false,
        "updatedAt": "2026-02-13T10:30:00Z"
      },
      {
        "id": "group-uuid",
        "type": "GROUP",
        "isGroup": true,
        "name": "Field Team - Mumbai",
        "participants": [
          { "id": "u1", "name": "Admin User" },
          { "id": "u2", "name": "Employee 1" },
          { "id": "u3", "name": "Employee 2" }
        ],
        "lastMessage": {
          "id": "msg-uuid-2",
          "content": "Meeting at 3 PM",
          "sender": { "id": "u1", "name": "Admin User" },
          "createdAt": "2026-02-13T09:15:00Z"
        },
        "unreadCount": 0,
        "isPinned": true,
        "updatedAt": "2026-02-13T09:15:00Z"
      }
    ]
  }
}

**Get Messages:**

GET /api/chats/chat-uuid/messages?page=1&limit=50

{
  "success": true,
  "data": {
    "messages": [
      {
        "id": "msg-uuid",
        "chatId": "chat-uuid",
        "sender": {
          "id": "user-uuid",
          "name": "Priya Sharma"
        },
        "content": "I'll visit ABC School tomorrow",
        "messageType": "TEXT",
        "status": "READ",
        "isEdited": false,
        "isDeleted": false,
        "replyTo": null,
        "reactions": [
          { "emoji": "👍", "count": 2, "users": ["u1", "u2"] }
        ],
        "createdAt": "2026-02-13T10:30:00Z"
      },
      {
        "id": "msg-uuid-2",
        "chatId": "chat-uuid",
        "sender": {
          "id": "admin-uuid",
          "name": "Admin User"
        },
        "content": "Great! Take photos of the classrooms",
        "messageType": "TEXT",
        "status": "DELIVERED",
        "replyTo": {
          "id": "msg-uuid",
          "content": "I'll visit ABC School tomorrow",
          "sender": { "name": "Priya Sharma" }
        },
        "createdAt": "2026-02-13T10:32:00Z"
      },
      {
        "id": "msg-uuid-3",
        "chatId": "chat-uuid",
        "sender": {
          "id": "user-uuid",
          "name": "Priya Sharma"
        },
        "messageType": "IMAGE",
        "fileUrl": "https://storage.googleapis.com/.../image.jpg",
        "fileName": "classroom_photo.jpg",
        "fileSize": 2048576,
        "createdAt": "2026-02-13T14:20:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 127,
      "hasMore": true
    }
  }
}

---

## 5. Socket.IO Events

### 5.1 Connection Events

**Client → Server:**

// Connect with authentication
socket.auth = { token: jwtToken };
socket.connect();

// Server authenticates and responds
socket.on('connect', () => {
  console.log('Connected:', socket.id);
});

socket.on('authenticated', (data) => {
  console.log('Authenticated as:', data.user);
});

**Server → Client:**

// Connection error
socket.on('connect_error', (error) => {
  console.error('Connection failed:', error.message);
});

// Disconnection
socket.on('disconnect', (reason) => {
  console.log('Disconnected:', reason);
});

### 5.2 Message Events

**Client → Server:**

// Send message
socket.emit('sendMessage', {
  chatId: 'chat-uuid',
  content: 'Hello!',
  messageType: 'TEXT',
  replyToId: 'msg-uuid' // Optional
}, (acknowledgment) => {
  console.log('Message sent:', acknowledgment.messageId);
});

// Mark message as delivered
socket.emit('messageDelivered', {
  messageId: 'msg-uuid'
});

// Mark message as read
socket.emit('messageRead', {
  messageId: 'msg-uuid'
});

// Typing indicator
socket.emit('typing', {
  chatId: 'chat-uuid',
  isTyping: true
});

**Server → Client:**

// New message received
socket.on('newMessage', (message) => {
  console.log('New message:', message);
  // Update UI with new message
});

// Message status updated
socket.on('messageStatusUpdated', (data) => {
  console.log('Status updated:', data);
  // Update message checkmarks
});

// User typing
socket.on('userTyping', (data) => {
  console.log(`${data.userName} is typing...`);
  // Show typing indicator
});

// User stopped typing
socket.on('userStoppedTyping', (data) => {
  // Hide typing indicator
});

### 5.3 Presence Events

**Client → Server:**

// Update online status
socket.emit('goOnline');
socket.emit('goOffline');

**Server → Client:**

// User came online
socket.on('userOnline', (data) => {
  console.log(`${data.userName} is now online`);
  // Update user status in UI
});

// User went offline
socket.on('userOffline', (data) => {
  console.log(`${data.userName} went offline at ${data.lastSeen}`);
  // Update user status in UI
});

### 5.4 Chat Events

**Server → Client:**

// New chat created (when added to group)
socket.on('chatCreated', (chat) => {
  console.log('Added to new chat:', chat);
  // Add chat to list
});

// Chat updated (name change, etc.)
socket.on('chatUpdated', (chat) => {
  // Update chat details
});

// Participant added to group
socket.on('participantAdded', (data) => {
  console.log(`${data.userName} joined ${data.chatName}`);
});

// Participant removed from group
socket.on('participantRemoved', (data) => {
  console.log(`${data.userName} left ${data.chatName}`);
});

### 5.5 Event Flow Examples

**Sending a Message:**

// 1. User types and sends message
const sendMessage = async (chatId, content) => {
  socket.emit('sendMessage', {
    chatId,
    content,
    messageType: 'TEXT'
  }, (ack) => {
    if (ack.success) {
      // Message sent successfully
      console.log('Message ID:', ack.messageId);
    }
  });
};

// 2. Recipient receives message
socket.on('newMessage', (message) => {
  // Display message in UI
  addMessageToChat(message);
  
  // Send delivered acknowledgment
  socket.emit('messageDelivered', {
    messageId: message.id
  });
});

// 3. Sender receives delivery confirmation
socket.on('messageStatusUpdated', (data) => {
  if (data.status === 'DELIVERED') {
    updateMessageStatus(data.messageId, 'DELIVERED');
  }
});

// 4. Recipient reads message
const markAsRead = (messageId) => {
  socket.emit('messageRead', { messageId });
};

// 5. Sender receives read confirmation
socket.on('messageStatusUpdated', (data) => {
  if (data.status === 'READ') {
    updateMessageStatus(data.messageId, 'READ'); // Blue checkmarks
  }
});

**Typing Indicator:**

let typingTimeout;

const handleTyping = (chatId) => {
  // Emit typing event
  socket.emit('typing', { chatId, isTyping: true });
  
  // Clear previous timeout
  clearTimeout(typingTimeout);
  
  // Stop typing after 3 seconds of inactivity
  typingTimeout = setTimeout(() => {
    socket.emit('typing', { chatId, isTyping: false });
  }, 3000);
};

// Recipient sees typing indicator
socket.on('userTyping', (data) => {
  showTypingIndicator(data.chatId, data.userName);
});

socket.on('userStoppedTyping', (data) => {
  hideTypingIndicator(data.chatId, data.userName);
});

---

## 6. Frontend Components

### 6.1 Component Structure

frontend/
├── app/
│   ├── (employee)/
│   │   └── chat/
│   │       └── page.tsx              # Chat page (full layout)
│   └── (admin)/
│       └── chat/
│           └── page.tsx              # Same chat interface
├── components/
│   ├── chat/
│   │   ├── ChatLayout.tsx            # Main layout (sidebar + conversation)
│   │   ├── ChatList.tsx              # Left sidebar - list of chats
│   │   ├── ChatListItem.tsx          # Individual chat item
│   │   ├── ChatConversation.tsx      # Right area - active chat
│   │   ├── ChatHeader.tsx            # Conversation header
│   │   ├── MessageList.tsx           # Scrollable message list
│   │   ├── MessageBubble.tsx         # Individual message
│   │   ├── MessageInput.tsx          # Input area + file upload
│   │   ├── TypingIndicator.tsx       # "User is typing..."
│   │   ├── MessageStatus.tsx         # Checkmarks (sent/delivered/read)
│   │   ├── NewChatDialog.tsx         # Create new chat modal
│   │   ├── GroupInfoDialog.tsx       # Group details modal
│   │   ├── FilePreview.tsx           # Image/file preview
│   │   └── MessageActions.tsx        # Reply/forward/delete menu
│   └── layout/
│       └── ChatNotifications.tsx     # Notification system
└── lib/
    ├── hooks/
    │   ├── useSocket.ts              # Socket.IO connection hook
    │   ├── useChat.ts                # Chat data and operations
    │   ├── useMessages.ts            # Message operations
    │   └── useTypingIndicator.ts     # Typing state management
    └── socket/
        ├── socketClient.ts           # Socket.IO client setup
        └── socketEvents.ts           # Event handlers

### 6.2 Key Components

**Socket.IO Hook (useSocket):**

// lib/hooks/useSocket.ts
import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export const useSocket = (token: string) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const socketInstance = io(process.env.NEXT_PUBLIC_API_URL!, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    socketInstance.on('connect', () => {
      console.log('Socket connected:', socketInstance.id);
      setConnected(true);
    });

    socketInstance.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      setConnected(false);
    });

    socketInstance.on('connect_error', (error) => {
      console.error('Connection error:', error);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [token]);

  return { socket, connected };
};

**Chat List Component:**

// components/chat/ChatList.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useChat } from '@/lib/hooks/useChat';
import { ChatListItem } from './ChatListItem';
import { NewChatDialog } from './NewChatDialog';

export const ChatList: React.FC = () => {
  const { chats, loading, selectedChat, selectChat } = useChat();
  const [filter, setFilter] = useState<'all' | 'unread' | 'groups'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredChats = chats.filter(chat => {
    if (filter === 'unread' && chat.unreadCount === 0) return false;
    if (filter === 'groups' && !chat.isGroup) return false;
    if (searchQuery && !chat.name?.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  return (
    <div className="w-full md:w-[30%] border-r flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Chats</h2>
          <NewChatDialog />
        </div>
        
        {/* Search */}
        <input
          type="text"
          placeholder="Search chats..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg"
        />
      </div>

      {/* Filters */}
      <div className="flex gap-2 p-2 border-b">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1 rounded ${filter === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          All
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-3 py-1 rounded ${filter === 'unread' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Unread
        </button>
        <button
          onClick={() => setFilter('groups')}
          className={`px-3 py-1 rounded ${filter === 'groups' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Groups
        </button>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-4 text-center">Loading chats...</div>
        ) : filteredChats.length === 0 ? (
          <div className="p-4 text-center text-gray-500">No chats found</div>
        ) : (
          filteredChats.map(chat => (
            <ChatListItem
              key={chat.id}
              chat={chat}
              isActive={selectedChat?.id === chat.id}
              onClick={() => selectChat(chat.id)}
            />
          ))
        )}
      </div>
    </div>
  );
};

**Message Bubble Component:**

// components/chat/MessageBubble.tsx
'use client';

import React from 'react';
import { Message } from '@/types/chat';
import { MessageStatus } from './MessageStatus';
import { formatMessageTime } from '@/lib/utils';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  showSender?: boolean;
  onReply?: (message: Message) => void;
  onReact?: (emoji: string) => void;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isOwn,
  showSender = false,
  onReply,
  onReact,
}) => {
  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-2`}>
      <div className={`max-w-[70%] ${isOwn ? 'order-2' : 'order-1'}`}>
        {/* Sender name (for group chats) */}
        {showSender && !isOwn && (
          <p className="text-xs text-gray-600 mb-1 ml-2">
            {message.sender.name}
          </p>
        )}

        {/* Reply context */}
        {message.replyTo && (
          <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded-t-lg ml-2 text-sm border-l-4 border-blue-500">
            <p className="font-semibold text-xs text-blue-600">
              {message.replyTo.sender.name}
            </p>
            <p className="text-gray-600 dark:text-gray-400 truncate">
              {message.replyTo.content}
            </p>
          </div>
        )}

        {/* Message bubble */}
        <div
          className={`rounded-lg px-4 py-2 ${
            isOwn
              ? 'bg-blue-500 text-white rounded-br-none'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-bl-none'
          }`}
        >
          {/* Deleted message */}
          {message.isDeleted ? (
            <p className="italic text-sm opacity-70">
              🚫 This message was deleted
            </p>
          ) : (
            <>
              {/* Image message */}
              {message.messageType === 'IMAGE' && (
                <img
                  src={message.fileUrl}
                  alt={message.fileName || 'Image'}
                  className="max-w-full rounded mb-2"
                />
              )}

              {/* File message */}
              {message.messageType === 'FILE' && (
                <a
                  href={message.fileUrl}
                  download={message.fileName}
                  className="flex items-center gap-2 p-2 bg-white bg-opacity-20 rounded mb-2"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0017.414 6L14 2.586A2 2 0 0012.586 2H8z" />
                  </svg>
                  <div>
                    <p className="font-medium">{message.fileName}</p>
                    <p className="text-xs opacity-70">
                      {(message.fileSize! / 1024).toFixed(0)} KB
                    </p>
                  </div>
                </a>
              )}

              {/* Text content */}
              {message.content && (
                <p className="whitespace-pre-wrap break-words">
                  {message.content}
                </p>
              )}
            </>
          )}

          {/* Message footer */}
          <div className="flex items-center justify-between gap-2 mt-1">
            <span className="text-xs opacity-70">
              {formatMessageTime(message.createdAt)}
              {message.isEdited && ' (edited)'}
            </span>
            
            {isOwn && <MessageStatus status={message.status} />}
          </div>

          {/* Reactions */}
          {message.reactions && message.reactions.length > 0 && (
            <div className="flex gap-1 mt-2">
              {message.reactions.map(reaction => (
                <span
                  key={reaction.emoji}
                  className="bg-white bg-opacity-20 px-2 py-1 rounded-full text-xs"
                >
                  {reaction.emoji} {reaction.count}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

**Message Input Component:**

// components/chat/MessageInput.tsx
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useSocket } from '@/lib/hooks/useSocket';

interface MessageInputProps {
  chatId: string;
  replyTo?: Message | null;
  onCancelReply?: () => void;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  chatId,
  replyTo,
  onCancelReply,
}) => {
  const [message, setMessage] = useState('');
  const [uploading, setUploading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { socket } = useSocket();

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  // Typing indicator
  useEffect(() => {
    if (message.length > 0) {
      socket?.emit('typing', { chatId, isTyping: true });
    } else {
      socket?.emit('typing', { chatId, isTyping: false });
    }
  }, [message, chatId, socket]);

  const handleSend = () => {
    if (!message.trim()) return;

    socket?.emit('sendMessage', {
      chatId,
      content: message.trim(),
      messageType: 'TEXT',
      replyToId: replyTo?.id,
    }, (ack: any) => {
      if (ack.success) {
        setMessage('');
        onCancelReply?.();
      }
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      // Upload file to server
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`/api/chats/${chatId}/upload`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      // Send message with file
      socket?.emit('sendMessage', {
        chatId,
        messageType: file.type.startsWith('image/') ? 'IMAGE' : 'FILE',
        fileUrl: data.fileUrl,
        fileName: file.name,
        fileSize: file.size,
      });
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="border-t p-4">
      {/* Reply preview */}
      {replyTo && (
        <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded mb-2 flex justify-between items-center">
          <div>
            <p className="text-xs font-semibold text-blue-600">
              Replying to {replyTo.sender.name}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
              {replyTo.content}
            </p>
          </div>
          <button onClick={onCancelReply} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>
      )}

      {/* Input area */}
      <div className="flex items-end gap-2">
        {/* File upload */}
        <label className="cursor-pointer p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
          <input
            type="file"
            className="hidden"
            onChange={handleFileUpload}
            accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
            disabled={uploading}
          />
          <svg className="w-6 h-6 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
            <path d="M8 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0017.414 6L14 2.586A2 2 0 0012.586 2H8z" />
          </svg>
        </label>

        {/* Text input */}
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="Type a message..."
          className="flex-1 px-4 py-2 border rounded-lg resize-none max-h-32 focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={1}
        />

        {/* Send button */}
        <button
          onClick={handleSend}
          disabled={!message.trim() || uploading}
          className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
          </svg>
        </button>
      </div>

      {uploading && <p className="text-sm text-gray-500 mt-2">Uploading...</p>}
    </div>
  );
};

---

## 7. Integration with Existing System

### 7.1 Navigation Integration

**Add Chat Icon to Navbar:**

// components/layout/Navbar.tsx
import { MessageCircle } from 'lucide-react';
import { useChatNotifications } from '@/lib/hooks/useChatNotifications';

export const Navbar = () => {
  const { unreadCount } = useChatNotifications();

  return (
    <nav>
      {/* ... existing nav items ... */}
      
      <Link href="/chat" className="relative">
        <MessageCircle className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </Link>
    </nav>
  );
};

### 7.2 School Visit Integration

**Quick Chat from Visit Page:**

// app/(employee)/visits/[id]/page.tsx
import { QuickChatButton } from '@/components/chat/QuickChatButton';

export default function VisitPage({ params }: { params: { id: string } }) {
  const { visit } = useVisit(params.id);

  return (
    <div>
      {/* ... visit details ... */}
      
      <div className="flex gap-2">
        <button>Submit Visit</button>
        
        {/* Quick chat with admin */}
        <QuickChatButton
          recipientId={visit.school.createdById}
          context={{
            type: 'visit',
            visitId: visit.id,
            schoolName: visit.school.name
          }}
        />
      </div>
    </div>
  );
};

### 7.3 Dashboard Integration

**Recent Messages Widget:**

// components/dashboard/RecentMessagesWidget.tsx
export const RecentMessagesWidget = () => {
  const { recentMessages } = useRecentMessages(5);

  return (
    <div className="card">
      <h3>Recent Messages</h3>
      {recentMessages.map(msg => (
        <Link key={msg.id} href={`/chat?chat=${msg.chatId}`}>
          <div className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded">
            <Avatar user={msg.sender} />
            <div className="flex-1">
              <p className="font-medium">{msg.sender.name}</p>
              <p className="text-sm text-gray-600 truncate">{msg.content}</p>
            </div>
            <span className="text-xs text-gray-500">
              {formatRelativeTime(msg.createdAt)}
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
};

### 7.4 Notification Integration

**Browser Notifications:**

// lib/notifications/chatNotifications.ts
export const requestNotificationPermission = async () => {
  if ('Notification' in window && Notification.permission === 'default') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  return Notification.permission === 'granted';
};

export const showChatNotification = (message: Message, chat: Chat) => {
  if (!document.hidden) return; // Don't show if tab is active

  if (Notification.permission === 'granted') {
    const notification = new Notification(message.sender.name, {
      body: message.content || 'Sent a file',
      icon: message.sender.avatar || '/default-avatar.png',
      tag: `chat-${chat.id}`,
      data: { chatId: chat.id },
    });

    notification.onclick = () => {
      window.focus();
      window.location.href = `/chat?chat=${chat.id}`;
      notification.close();
    };

    // Play notification sound
    const audio = new Audio('/notification-sound.mp3');
    audio.play().catch(console.error);
  }
};

---

## 8. Implementation Roadmap

### Phase 1: Foundation (Week 1-2)

**Week 1: Backend Setup**
- [ ] Install Socket.IO on backend (`npm install socket.io`)
- [ ] Create database schema and Prisma migration
- [ ] Implement Socket.IO server setup
- [ ] Add authentication middleware for WebSocket
- [ ] Create chat and message CRUD endpoints
- [ ] Implement room management

**Week 2: Basic Real-Time**
- [ ] Implement message sending/receiving
- [ ] Add message persistence to PostgreSQL
- [ ] Create message delivery status system
- [ ] Set up user presence tracking
- [ ] Basic file upload to existing GCS bucket
- [ ] Write unit tests for chat API

### Phase 2: Frontend & UI (Week 3-4)

**Week 3: Core UI**
- [ ] Install Socket.IO client (`npm install socket.io-client`)
- [ ] Create Socket.IO React hooks
- [ ] Build chat layout (sidebar + conversation)
- [ ] Implement chat list component
- [ ] Create message bubble component
- [ ] Build message input with auto-resize
- [ ] Add chat header with online status

**Week 4: Advanced UI**
- [ ] Implement infinite scroll for messages
- [ ] Add typing indicator
- [ ] Create message status indicators (checkmarks)
- [ ] Build file upload UI with preview
- [ ] Add emoji support
- [ ] Implement date separators
- [ ] Mobile responsive design

### Phase 3: Features (Week 5-6)

**Week 5: Rich Messaging**
- [ ] Reply to message functionality
- [ ] Message editing (within 15 min)
- [ ] Message deletion (soft delete)
- [ ] Message reactions (emoji)
- [ ] Forward message feature
- [ ] Copy message text
- [ ] Link detection and preview

**Week 6: Group Chat**
- [ ] Create group chat
- [ ] Add/remove participants
- [ ] Group info page
- [ ] Leave group functionality
- [ ] Group name and description
- [ ] Member list display
- [ ] Admin permissions

### Phase 7: Polish & Advanced (Week 7-8)

**Week 7: Search & Organization**
- [ ] Global chat search
- [ ] Search within conversation
- [ ] Pin chats to top
- [ ] Archive chats
- [ ] Delete/hide conversations
- [ ] Unread badge system
- [ ] Filter chats (all/unread/groups)

**Week 8: Notifications & Integration**
- [ ] Browser push notifications
- [ ] Sound notifications
- [ ] Notification settings page
- [ ] Integrate with dashboard widget
- [ ] Quick chat from visit page
- [ ] Navbar unread badge
- [ ] End-to-end testing

### Phase 9: Deployment (Week 9)

- [ ] Database migration to production
- [ ] Socket.IO configuration for production
- [ ] Nginx WebSocket proxy configuration
- [ ] PM2 process management for Socket.IO
- [ ] Performance optimization (connection pooling)
- [ ] Load testing (100+ concurrent connections)
- [ ] Monitoring and logging setup
- [ ] User documentation
- [ ] Launch!

---

## 9. Security Considerations

### 9.1 WebSocket Authentication

**JWT-Based Socket Authentication:**

// backend/src/socket/middleware/auth.ts
import { Socket } from 'socket.io';
import jwt from 'jsonwebtoken';

export const socketAuthMiddleware = async (socket: Socket, next: any) => {
  try {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      return next(new Error('Authentication token required'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    
    socket.data.userId = decoded.userId;
    socket.data.userRole = decoded.role;
    
    next();
  } catch (error) {
    next(new Error('Invalid authentication token'));
  }
};

// Usage in Socket.IO server
io.use(socketAuthMiddleware);

### 9.2 Message Authorization

**Room-Based Access Control:**

// backend/src/socket/handlers/chatHandlers.ts
export const handleSendMessage = async (
  socket: Socket,
  data: SendMessageData,
  callback: (response: any) => void
) => {
  const userId = socket.data.userId;
  const { chatId, content } = data;

  // Check if user is participant in chat
  const participant = await prisma.chatParticipant.findUnique({
    where: {
      chatId_userId: {
        chatId,
        userId
      }
    }
  });

  if (!participant) {
    return callback({
      success: false,
      error: 'You are not a participant in this chat'
    });
  }

  // Save message and broadcast
  const message = await prisma.message.create({
    data: {
      chatId,
      senderId: userId,
      content,
      messageType: 'TEXT'
    },
    include: {
      sender: {
        select: { id: true, name: true, avatar: true }
      }
    }
  });

  // Broadcast to chat room
  io.to(`chat-${chatId}`).emit('newMessage', message);

  callback({ success: true, messageId: message.id });
};

### 9.3 Rate Limiting

**Socket Event Rate Limiting:**

// backend/src/socket/middleware/rateLimit.ts
import { RateLimiter } from 'limiter';

const limiters = new Map<string, RateLimiter>();

export const socketRateLimitMiddleware = (
  event: string,
  tokensPerInterval: number,
  interval: 'second' | 'minute'
) => {
  return async (socket: Socket, data: any, next: any) => {
    const userId = socket.data.userId;
    const key = `${userId}-${event}`;

    if (!limiters.has(key)) {
      limiters.set(key, new RateLimiter({
        tokensPerInterval,
        interval
      }));
    }

    const limiter = limiters.get(key)!;
    const hasToken = await limiter.tryRemoveTokens(1);

    if (!hasToken) {
      return next(new Error('Rate limit exceeded'));
    }

    next();
  };
};

// Usage
socket.on('sendMessage', 
  socketRateLimitMiddleware('sendMessage', 20, 'minute'),
  handleSendMessage
);

**API Rate Limits:**
- Message sending: 20 per minute per user
- Typing events: 60 per minute per user
- File uploads: 5 per minute per user
- Chat creation: 10 per hour per user

### 9.4 File Security

**File Upload Validation:**

// backend/src/middleware/fileValidation.ts
import multer from 'multer';

const allowedMimeTypes = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];

export const chatFileUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB
  },
  fileFilter: (req, file, cb) => {
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  },
});

### 9.5 Message Encryption (Optional - Phase 2)

**End-to-End Encryption:**
- Client-side encryption using Web Crypto API
- Server stores encrypted message content
- Keys exchanged during chat initialization
- Only participants can decrypt messages

### 9.6 XSS Prevention

**Content Sanitization:**

// lib/utils/sanitize.ts
import DOMPurify from 'isomorphic-dompurify';

export const sanitizeMessage = (content: string): string => {
  return DOMPurify.sanitize(content, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a'],
    ALLOWED_ATTR: ['href', 'target'],
  });
};

// Auto-link URLs
export const linkifyMessage = (content: string): string => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return content.replace(urlRegex, (url) => {
    return `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`;
  });
};

### 9.7 CORS Configuration

**Socket.IO CORS:**

// backend/src/socket/index.ts
import { Server } from 'socket.io';

const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ['GET', 'POST'],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
});

---

## 10. Cost Impact Analysis

### 10.1 Infrastructure Costs

**Existing Infrastructure:**
- GCP e2-micro VM: ₹0 (Always Free)
- PostgreSQL: ₹0 (VM-hosted)
- Cloud Storage: ₹0-200 (5GB free tier)

**Chat Feature Impact:**

**Database Storage:**
- Average message: 0.5KB (text + metadata)
- 50 messages/day × 30 days = 1,500 messages/month
- Storage: 1,500 × 0.5KB = 750KB/month
- Annual: 750KB × 12 = 9MB/year
- **Impact:** Negligible (< 0.1% of VM disk)

**File Storage:**
- Assume 10% of messages include files (5 files/day)
- Average file size: 2MB (images/documents)
- Daily storage: 5 × 2MB = 10MB/day
- Monthly: 10MB × 30 = 300MB/month

**GCP Cloud Storage:**
- Current usage: ~2GB
- With chat: 2GB + 0.3GB = 2.3GB
- Still within 5GB free tier
- **Additional cost: ₹0**

**Bandwidth:**
- Message traffic: ~1MB/day (text messages)
- File downloads: ~50MB/day (assume 25 file views)
- Monthly bandwidth: 51MB × 30 = 1.5GB
- Current free tier: 1GB/month (India region)
- Overage: 0.5GB × ₹8/GB = ₹4/month
- **Additional cost: ₹0-10/month**

**WebSocket Connections:**
- Socket.IO runs on existing Express server
- No additional compute cost
- Memory impact: ~50MB for 10 concurrent connections
- e2-micro handles this within 1GB RAM
- **Additional cost: ₹0**

### 10.2 Total Cost Summary

| Resource | Current | With Chat | Additional Cost |
|----------|---------|-----------|-----------------|
| VM Compute | ₹0 | ₹0 | ₹0 |
| Database | ₹0 | ₹0 | ₹0 |
| Storage | ₹0-200 | ₹0-200 | ₹0 |
| Bandwidth | ₹0 | ₹0-10 | ₹0-10 |
| **Monthly Total** | **₹150-500** | **₹150-510** | **₹0-10** |

**Conclusion:** Chat feature adds **₹0-10/month additional cost**, staying within existing infrastructure and free tier limits[4][5].

### 10.3 Scaling Considerations

**When to Upgrade:**
- More than 50 concurrent connections
- Message volume exceeds 5,000/day
- File storage exceeds 5GB/month
- VM CPU consistently > 80%

**Scaling Path:**
1. **Upgrade VM** to e2-small (₹400/month) for 2GB RAM
2. **Use Cloud SQL** (₹1,200+/month) for managed PostgreSQL
3. **Add Redis** for Socket.IO adapter (multi-server scaling)
4. **Implement CDN** for file delivery (₹200+/month)

**Cost at 100 users:**
- VM: ₹400 (e2-small)
- Storage: ₹400 (15GB)
- Bandwidth: ₹100
- **Total: ~₹900/month** (still 90% cheaper than AWS equivalent)

---

## Appendix A: Backend Implementation Example

### Socket.IO Server Setup

// backend/src/socket/index.ts
import { Server } from 'socket.io';
import { createServer } from 'http';
import { socketAuthMiddleware } from './middleware/auth';
import {
  handleSendMessage,
  handleTyping,
  handleMessageRead,
  handleMessageDelivered,
} from './handlers/chatHandlers';

export const initializeSocketIO = (httpServer: any) => {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL,
      methods: ['GET', 'POST'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  // Authentication middleware
  io.use(socketAuthMiddleware);

  // Connection handler
  io.on('connection', async (socket) => {
    const userId = socket.data.userId;
    console.log(`User ${userId} connected: ${socket.id}`);

    // Join user's personal room
    socket.join(`user-${userId}`);

    // Join all chats user is participant in
    const chats = await prisma.chatParticipant.findMany({
      where: { userId },
      select: { chatId: true }
    });

    chats.forEach(chat => {
      socket.join(`chat-${chat.chatId}`);
    });

    // Emit online status to all contacts
    socket.broadcast.emit('userOnline', {
      userId,
      socketId: socket.id
    });

    // Message events
    socket.on('sendMessage', (data, callback) => 
      handleSendMessage(socket, io, data, callback)
    );

    socket.on('messageDelivered', (data) => 
      handleMessageDelivered(socket, io, data)
    );

    socket.on('messageRead', (data) => 
      handleMessageRead(socket, io, data)
    );

    // Typing indicator
    socket.on('typing', (data) => 
      handleTyping(socket, io, data)
    );

    // Disconnect handler
    socket.on('disconnect', () => {
      console.log(`User ${userId} disconnected: ${socket.id}`);
      
      // Emit offline status
      socket.broadcast.emit('userOffline', {
        userId,
        lastSeen: new Date()
      });
    });
  });

  return io;
};

### Message Handler Example

// backend/src/socket/handlers/chatHandlers.ts
import { Socket, Server } from 'socket.io';
import { prisma } from '../../config/database';

export const handleSendMessage = async (
  socket: Socket,
  io: Server,
  data: any,
  callback: any
) => {
  try {
    const userId = socket.data.userId;
    const { chatId, content, messageType, fileUrl, fileName, fileSize, replyToId } = data;

    // Verify participant
    const participant = await prisma.chatParticipant.findUnique({
      where: {
        chatId_userId: {
          chatId,
          userId
        }
      }
    });

    if (!participant) {
      return callback({
        success: false,
        error: 'Not authorized'
      });
    }

    // Create message
    const message = await prisma.message.create({
      data: {
        chatId,
        senderId: userId,
        content,
        messageType,
        fileUrl,
        fileName,
        fileSize,
        replyToId
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        },
        replyTo: {
          select: {
            id: true,
            content: true,
            sender: {
              select: { name: true }
            }
          }
        }
      }
    });

    // Create message status for each participant (except sender)
    const participants = await prisma.chatParticipant.findMany({
      where: {
        chatId,
        userId: { not: userId }
      }
    });

    await prisma.messageStatus.createMany({
      data: participants.map(p => ({
        messageId: message.id,
        userId: p.userId,
        status: 'SENT'
      }))
    });

    // Broadcast to chat room
    io.to(`chat-${chatId}`).emit('newMessage', {
      ...message,
      status: 'SENT'
    });

    // Update chat's updatedAt
    await prisma.chat.update({
      where: { id: chatId },
      data: { updatedAt: new Date() }
    });

    callback({
      success: true,
      messageId: message.id
    });
  } catch (error) {
    console.error('Send message error:', error);
    callback({
      success: false,
      error: 'Failed to send message'
    });
  }
};

---

## Appendix B: Testing Checklist

### Unit Tests

- [ ] Socket authentication middleware
- [ ] Message CRUD operations
- [ ] Chat participant management
- [ ] Message status updates
- [ ] File upload validation
- [ ] Rate limiting logic

### Integration Tests

- [ ] Send message flow (end-to-end)
- [ ] Message delivery status tracking
- [ ] Typing indicator broadcast
- [ ] Group chat message distribution
- [ ] File upload and retrieval
- [ ] Online/offline presence updates

### Frontend Tests

- [ ] Socket connection and authentication
- [ ] Message rendering (text, image, file)
- [ ] Message status display (checkmarks)
- [ ] Typing indicator UI
- [ ] Unread badge updates
- [ ] Infinite scroll loading
- [ ] Message input auto-resize

### End-to-End Tests

- [ ] Complete chat lifecycle (create → send → receive → read)
- [ ] Group chat creation and messaging
- [ ] File sharing workflow
- [ ] Reply to message functionality
- [ ] Message editing and deletion
- [ ] Search functionality
- [ ] Browser notifications

### Performance Tests

- [ ] 50 concurrent connections handling
- [ ] Message throughput (100 messages/second)
- [ ] File upload speed (25MB files)
- [ ] Message history pagination (1000+ messages)
- [ ] Database query performance
- [ ] WebSocket reconnection behavior

### Security Tests

- [ ] Unauthorized access prevention
- [ ] XSS prevention in messages
- [ ] File upload validation
- [ ] Rate limiting enforcement
- [ ] CSRF protection
- [ ] SQL injection prevention

---

## References

[1] VideoSDK. (2025). Node.js Realtime Chat: Build a Scalable Application. https://videosdk.live/developer-hub/webrtc/node-js-realtime-chat

[2] Talent500. (2025). Build a Real-Time Chat App with WebSockets & Socket.IO. https://talent500.com/blog/implementing-a-real-time-chat-application-using-websockets-and-socket-io/

[3] Dev.to. (2024). Building a Simple Real-Time Chat Application with Socket.IO. https://dev.to/sanx/creating-a-simple-real-time-chat-application-with-socketio-33j2

[4] AlgoMaster. (2025). Design Whatsapp: System Design Interview. https://algomaster.io/learn/system-design-interviews/design-whatsapp

[5] PubNub. (2024). Building a Chat Application Using Node.js. https://www.pubnub.com/blog/building-chat-application-using-node-js/

[6] Stack Overflow. (2018). PostgreSQL: Database structure for Chat Conversation. https://stackoverflow.com/questions/52662334/postgresql-database-structure-for-chat-conversation

[7] GeeksforGeeks. (2023). How to Create a Chat App Using socket.io in NodeJS? https://www.geeksforgeeks.org/node-js/how-to-create-a-chat-app-using-socket-io-node-js/

---

**Document Version:** 1.0  
**Last Updated:** February 13, 2026  
**Target Integration:** School Assessment & CSR Management System (GCP Single-VM)  
**Estimated Timeline:** 9 weeks  
**Additional Cost:** ₹0-10/month (within existing free tier)

---

**END OF SPECIFICATION**