# ChatApp Backend

A real-time chat application backend built with Node.js, Express, Socket.IO, and TypeScript. Features include user authentication, real-time messaging, file uploads, and push notifications.

## Features

- 🔐 JWT-based authentication (email/password + Google OAuth)
- 💬 Real-time messaging with Socket.IO
- 📁 File uploads with Cloudinary
- 🔔 Push notifications with Firebase
- 📧 Email verification with OTP
- 👥 User management and online status
- 📚 Complete API documentation with Swagger

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose
- **Real-time**: Socket.IO
- **File Storage**: Cloudinary
- **Authentication**: JWT
- **Email**: Nodemailer
- **Notifications**: Firebase Cloud Messaging
- **Documentation**: Swagger/OpenAPI
- **Deployment**: Vercel (Serverless)

## Local Development

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- Cloudinary account
- Firebase project
- Gmail account (for email)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```

4. Fill in your environment variables in `.env`

5. Start the development server:
   ```bash
   npm run dev
   ```

The server will start on `http://localhost:8000`

## API Documentation

Access the Swagger documentation at:
- **Local Development**: `http://localhost:8000/api-docs`
- **Production**: `https://chat-app-backend-swart.vercel.app/api-docs`
- **Preview**: `https://chat-app-backend-obqf4yxls-sourav1234s-projects-176421f8.vercel.app/api-docs`

## Deployment to Vercel

### Prerequisites

- Vercel account
- All environment variables configured

### Steps

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   vercel
   ```

   Follow the prompts to configure your project.

4. **Set Environment Variables** in Vercel Dashboard:
   - Go to your project dashboard
   - Navigate to Settings → Environment Variables
   - Add all variables from `.env.example`

5. **Redeploy** after setting environment variables:
   ```bash
   vercel --prod
   ```

### Important Notes for Vercel Deployment

- The app is configured for serverless deployment
- Socket.IO works in serverless environments
- File uploads are handled via Cloudinary
- Database connections use connection pooling
- Environment variables must be set in Vercel dashboard

## Project Structure

```
src/
├── config/           # Configuration files
├── controllers/      # Route controllers
├── middlewares/      # Express middlewares
├── models/          # Mongoose models
├── routes/          # API routes
├── sockets/         # Socket.IO handlers
├── utils/           # Utility functions
└── server.ts        # Main server file

api/
└── index.ts         # Vercel serverless entry point

uploads/             # Temporary file uploads
```

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run swagger` - Generate Swagger documentation

## Environment Variables

See `.env.example` for all required environment variables.

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/google` - Google OAuth login
- `POST /api/auth/verify-otp` - Verify email OTP

### Chat
- `GET /api/chat/conversations` - Get user conversations
- `POST /api/chat/conversation` - Create new conversation
- `GET /api/chat/conversation/:id` - Get conversation details

### Messages
- `GET /api/messages/:conversationId` - Get conversation messages
- `POST /api/messages` - Send new message
- `PUT /api/messages/:id` - Update message
- `DELETE /api/messages/:id` - Delete message

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/search` - Search users

### Notifications
- `POST /api/notifications/subscribe` - Subscribe to push notifications

## Socket Events

### Connection
- `connection` - User connects
- `disconnect` - User disconnects

### Authentication
- `authenticate` - Authenticate socket connection

### Messaging
- `join_conversation` - Join conversation room
- `leave_conversation` - Leave conversation room
- `send_message` - Send message to conversation
- `message_received` - Message received confirmation

### Status
- `user_online` - User comes online
- `user_offline` - User goes offline
- `typing_start` - User starts typing
- `typing_stop` - User stops typing

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests
5. Submit a pull request

## License

This project is licensed under the MIT License.