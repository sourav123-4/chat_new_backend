import path from 'path';
import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'ChatApp API Documentation',
      version: '1.0.0',
      description: 'Complete API documentation for ChatApp Backend\n\n📞 **WebSocket Events:** See `SOCKET_EVENTS.md` in project root for detailed Socket.IO documentation',
      contact: {
        name: 'ChatApp Support',
        email: 'support@chatapp.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:8000',
        description: 'Development Server',
      },
      {
        url: 'https://chat-app-backend-swart.vercel.app',
        description: 'Production Server',
      },
      {
        url: 'https://chat-app-backend-obqf4yxls-sourav1234s-projects-176421f8.vercel.app',
        description: 'Preview Server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT token obtained from login or signup',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '60d5ec49f1b2c72d8c8e4a1a' },
            name: { type: 'string', example: 'John Doe' },
            email: { type: 'string', example: 'john@example.com' },
            avatar: { type: 'string', example: 'https://cloudinary.com/avatar.jpg' },
            isEmailVerified: { type: 'boolean', example: true },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Message: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            conversationId: { type: 'string' },
            senderId: { type: 'string' },
            text: { type: 'string' },
            file: {
              type: 'object',
              properties: {
                url: { type: 'string' },
                type: { type: 'string', enum: ['image', 'video', 'file'] },
                name: { type: 'string' },
                size: { type: 'number' },
              },
            },
            messageType: { type: 'string', enum: ['text', 'image', 'video', 'audio', 'file'] },
            status: { type: 'string', enum: ['sending', 'sent', 'delivered', 'read'] },
            readBy: { type: 'array', items: { type: 'string' } },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Conversation: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            isGroup: { type: 'boolean' },
            groupName: { type: 'string' },
            participants: { type: 'array', items: { type: 'string' } },
            lastMessage: { type: 'string' },
            lastMessageAt: { type: 'string', format: 'date-time' },
            lastMessageSenderId: { type: 'string' },
            lastMessageStatus: { type: 'string', enum: ['sent', 'delivered', 'read'] },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: [
    path.join(process.cwd(), 'src/routes/*.routes.ts'),
    path.join(process.cwd(), 'dist/routes/*.routes.js'), // For compiled code
    path.join(process.cwd(), 'routes/*.routes.js'),      // Common Vercel path
  ],
};

export const specs = swaggerJsdoc(options);
