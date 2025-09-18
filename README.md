# Chat Backend - MERN Stack Learning Project

A simple and well-documented backend API for a chat application built with Node.js, Express.js, MongoDB, and OpenRouter AI integration. This project is designed for learning the MERN stack with detailed documentation for every function and concept.

## 🎯 Learning Objectives

This project covers the following MERN stack concepts:

- **Express.js**: Web framework, routing, middleware, error handling
- **MongoDB**: Database design, Mongoose ODM, schemas, models
- **Node.js**: Server-side JavaScript, ES6 modules, async/await
- **Authentication**: JWT tokens, password hashing, protected routes
- **API Design**: RESTful endpoints, request/response handling
- **Error Handling**: Try-catch blocks, validation, error responses
- **AI Integration**: OpenRouter API integration, external service communication
- **Health Monitoring**: System health checks, service monitoring

## 📁 Project Structure

```
chat-backend/
├── app.js                 # Main server file
├── package.json           # Dependencies and scripts
├── env.example           # Environment variables template
├── README.md             # This documentation
├── configs/
│   └── database.js       # Database connection configuration
├── controllers/
│   ├── authController.js # Authentication logic
│   ├── chatController.js # Chat functionality logic
│   └── healthController.js # Health check logic
├── models/
│   ├── User.js          # User schema and model
│   └── Chat.js          # Chat schema and model
├── routes/
│   ├── authRoutes.js    # Authentication routes
│   ├── chatRoutes.js    # Chat routes
│   └── healthRoutes.js  # Health check routes
├── services/
│   └── aiService.js     # OpenRouter AI integration
└── utils/
    └── helpers.js       # Common utility functions
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd chat-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   ```
   
   Edit the `.env` file with your configuration:
   ```env
   PORT=3200
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/chat-app
   JWT_SECRET=your-super-secret-jwt-key
   JWT_EXPIRES_IN=7d
   FRONTEND_URL=http://localhost:3000
   
   # OpenRouter AI Configuration
   OPENROUTER_API_KEY=your-openrouter-api-key-here
   OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
   OPENROUTER_MODEL=meta-llama/llama-3.1-8b-instruct:free
   ```

4. **Set up OpenRouter AI (Optional but Recommended)**
   - Visit [OpenRouter.ai](https://openrouter.ai/) and create an account
   - Generate a free API key from your dashboard
   - Add the API key to your `.env` file
   - The app will work without AI (with simulated responses) if not configured

5. **Start MongoDB**
   - Local: Make sure MongoDB is running on your system
   - Cloud: Use MongoDB Atlas connection string

6. **Run the application**
   ```bash
   # Development mode (with auto-restart)
   npm run dev
   
   # Production mode
   npm start
   ```

7. **Verify the server is running**
   ```bash
   curl http://localhost:3200
   ```

8. **Test AI service (if configured)**
   ```bash
   curl http://localhost:3200/api/health/ai
   ```

## 📚 API Documentation

### Base URL
```
http://localhost:3200/api
```

### Authentication Endpoints

#### 1. User Registration
```http
POST /api/auth/signup
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "user-id",
      "name": "John Doe",
      "email": "john@example.com",
      "createdAt": "2023-..."
    },
    "token": "jwt-token-here"
  }
}
```

#### 2. User Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "user-id",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "token": "jwt-token-here"
  }
}
```

#### 3. Get User Profile
```http
GET /api/auth/profile
Authorization: Bearer <jwt-token>
```

#### 4. User Logout
```http
POST /api/auth/logout
Authorization: Bearer <jwt-token>
```

### Health Check Endpoints

#### 1. Basic Health Check
```http
GET /api/health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2023-12-01T10:00:00.000Z",
  "uptime": 12345,
  "version": "1.0.0",
  "environment": "development"
}
```

#### 2. Detailed Health Check
```http
GET /api/health/detailed
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2023-12-01T10:00:00.000Z",
  "uptime": 12345,
  "version": "1.0.0",
  "environment": "development",
  "services": {
    "database": {
      "status": "connected",
      "database": "chat-app",
      "host": "localhost",
      "port": 27017
    },
    "ai": {
      "configured": true,
      "connected": true,
      "message": "OpenRouter configuration is valid"
    }
  }
}
```

#### 3. AI Service Health Check
```http
GET /api/health/ai
```

#### 4. Database Health Check
```http
GET /api/health/database
```

### Chat Endpoints

#### 1. Send Message
```http
POST /api/chat/message
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "message": "Hello!",
  "chatId": "optional-chat-id"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Message sent successfully",
  "data": {
    "chatId": "chat-id",
    "messages": [
      {
        "content": "Hello!",
        "sender": "user",
        "timestamp": "2023-...",
        "messageId": "msg-id"
      },
      {
        "content": "Hello! How can I help you today?",
        "sender": "ai",
        "timestamp": "2023-...",
        "messageId": "msg-id"
      }
    ],
    "messageCount": 2,
    "aiServiceStatus": "success",
    "aiError": null
  }
}
```

#### 2. Get Chat History
```http
GET /api/chat/history?limit=20&page=1
Authorization: Bearer <jwt-token>
```

#### 3. Get Specific Chat
```http
GET /api/chat/:chatId?limit=50
Authorization: Bearer <jwt-token>
```

#### 4. Create New Chat
```http
POST /api/chat/new
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "title": "My New Chat"
}
```

#### 5. Delete Chat
```http
DELETE /api/chat/:chatId
Authorization: Bearer <jwt-token>
```

#### 6. Update Chat Title
```http
PUT /api/chat/:chatId/title
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "title": "Updated Chat Title"
}
```

## 🗄️ Database Schema

### User Model
```javascript
{
  name: String (required, 2-50 characters),
  email: String (required, unique, valid email),
  password: String (required, min 6 characters, hashed),
  createdAt: Date (auto-generated),
  updatedAt: Date (auto-generated)
}
```

### Chat Model
```javascript
{
  title: String (required, max 100 characters),
  userId: ObjectId (reference to User),
  messages: [{
    content: String (required, 1-5000 characters),
    sender: String (enum: ['user', 'ai']),
    timestamp: Date (auto-generated),
    messageId: String (unique identifier)
  }],
  isActive: Boolean (default: true),
  lastMessageAt: Date (auto-updated),
  createdAt: Date (auto-generated),
  updatedAt: Date (auto-generated)
}
```

## 🔧 Key Features Explained

### 1. Authentication System
- **Password Hashing**: Uses bcryptjs to hash passwords before storing
- **JWT Tokens**: Secure authentication with JSON Web Tokens
- **Protected Routes**: Middleware to verify authentication
- **Input Validation**: Email format and password strength validation

### 2. Chat System
- **Message Storage**: Messages stored as subdocuments in chat documents
- **AI Integration**: Real AI responses using OpenRouter's free LLM models
- **Chat History**: Paginated retrieval of user's chat history
- **Context Awareness**: AI maintains conversation context across messages
- **Real-time Ready**: Structure supports WebSocket integration

### 3. Error Handling
- **Try-Catch Blocks**: Comprehensive error handling in all controllers
- **Validation Errors**: Detailed validation error messages
- **HTTP Status Codes**: Proper status codes for different scenarios
- **Logging**: Console logging for debugging and monitoring

### 4. AI Integration
- **OpenRouter API**: Integration with OpenRouter's free LLM models
- **Error Handling**: Graceful fallback when AI service is unavailable
- **Context Management**: Maintains conversation context for better responses
- **Health Monitoring**: AI service status monitoring and diagnostics

### 5. Security Features
- **CORS Configuration**: Cross-origin resource sharing setup
- **Password Security**: Never store plain text passwords
- **Token Expiration**: JWT tokens expire after specified time
- **Input Sanitization**: Trim and validate all user inputs
- **API Key Security**: Secure handling of external API keys

## 🧪 Testing the API

### Using cURL

1. **Check server health:**
   ```bash
   curl http://localhost:3200/api/health
   ```

2. **Check AI service status:**
   ```bash
   curl http://localhost:3200/api/health/ai
   ```

3. **Register a new user:**
   ```bash
   curl -X POST http://localhost:3200/api/auth/signup \
     -H "Content-Type: application/json" \
     -d '{"name":"Test User","email":"test@example.com","password":"password123"}'
   ```

4. **Login:**
   ```bash
   curl -X POST http://localhost:3200/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"password123"}'
   ```

5. **Send a message (replace TOKEN with actual token):**
   ```bash
   curl -X POST http://localhost:3200/api/chat/message \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer TOKEN" \
     -d '{"message":"Hello!"}'
   ```

### Using Postman

1. Import the API endpoints into Postman
2. Set up environment variables for base URL and tokens
3. Test the authentication flow first
4. Use the token for protected endpoints

## 🐛 Common Issues and Solutions

### 1. MongoDB Connection Error
```
Error: MongoDB connection failed
```
**Solution:** 
- Ensure MongoDB is running locally, or
- Check your MongoDB Atlas connection string
- Verify the MONGODB_URI in your .env file

### 2. JWT Token Error
```
Error: Invalid token
```
**Solution:**
- Make sure you're including the token in the Authorization header
- Check if the token has expired
- Verify the JWT_SECRET matches between token creation and verification

### 3. AI Service Error
```
Error: AI service is not properly configured
```
**Solution:**
- Check if OPENROUTER_API_KEY is set in your .env file
- Verify your OpenRouter API key is valid
- Test the AI service: `curl http://localhost:3200/api/health/ai`
- Check OpenRouter dashboard for API usage limits

### 4. AI Response Error
```
Error: Failed to get AI response
```
**Solution:**
- Check your internet connection
- Verify OpenRouter service status
- Check API key permissions and limits
- Review server logs for detailed error messages

### 5. CORS Error
```
Error: CORS policy blocked
```
**Solution:**
- Check the FRONTEND_URL in your .env file
- Ensure the frontend is running on the correct port
- Verify CORS configuration in app.js

## 📖 Learning Resources

### Express.js
- [Express.js Official Documentation](https://expressjs.com/)
- [Express.js Middleware Guide](https://expressjs.com/en/guide/using-middleware.html)
- [Express.js Routing](https://expressjs.com/en/guide/routing.html)

### MongoDB & Mongoose
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Mongoose Documentation](https://mongoosejs.com/docs/)
- [MongoDB University](https://university.mongodb.com/)

### JWT Authentication
- [JWT.io](https://jwt.io/)
- [JSON Web Token RFC](https://tools.ietf.org/html/rfc7519)

### Node.js
- [Node.js Documentation](https://nodejs.org/docs/)
- [ES6 Modules](https://nodejs.org/api/esm.html)

### OpenRouter AI
- [OpenRouter Documentation](https://openrouter.ai/docs)
- [OpenRouter Models](https://openrouter.ai/models)
- [OpenRouter API Reference](https://openrouter.ai/docs/api)

## 🤝 Contributing

This is a learning project, but contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes with detailed comments
4. Test your changes
5. Submit a pull request

## 📝 License

This project is for educational purposes. Feel free to use it for learning and teaching.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the documentation above
2. Review the code comments
3. Check the console logs for error messages
4. Ensure all dependencies are installed correctly

---

**Happy Learning! 🚀**

This project is designed to help you understand the MERN stack through practical implementation. Each file contains detailed comments explaining the concepts and implementation details.
