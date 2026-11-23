# ChatX

A real-time, one-to-one chat app. Sign up with an email-verified account, start a conversation with any user, and messages arrive instantly over Socket.IO, with read receipts and file attachments. Built with Next.js, TypeScript and MongoDB.

## Features

- **Live messaging.** Messages, new conversations and unread updates are pushed to both people over Socket.IO, with no page refresh.
- **Email-verified sign-up.** New accounts confirm their email with a 6-digit code sent over SMTP; passwords are hashed with bcrypt.
- **Sessions with JWT.** A signed token in a cookie keeps you signed in for an hour; the dashboard is protected by middleware.
- **Conversations.** A sidebar lists your conversations with the latest message; open one to see the full history.
- **Read receipts.** Messages are marked as seen when the other person opens the conversation.
- **Attachments.** Send files up to 20 MB alongside messages.
- **Encrypted API payloads.** Request and response bodies for the sign-up, sign-in and chat endpoints are encrypted with AES-256-CBC.

## Tech stack

| Part | Built with |
| --- | --- |
| Frontend | Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS |
| Backend | Next.js API routes, Socket.IO |
| Database | MongoDB with Mongoose |
| Auth | JWT, bcrypt, email codes via Nodemailer |
| Uploads | Formidable |

## How it works

```
browser ──HTTP──► Next.js API routes ──► MongoDB
   │                    │
   └──Socket.IO────────►└─ /api/socketio (rooms per user and per conversation)
```

1. **Sign up:** the app emails a code; entering it with a username and password creates the account.
2. **Sign in:** username or email plus password returns a JWT stored in a cookie.
3. **Chat:** the dashboard connects to Socket.IO, joins a room for the user and one for the open conversation, and saves each message through the API before broadcasting it to the other person.

## Project structure

```
app/            pages (landing, login, register, dashboard), components and user context
pages/api/      auth, chat, user and Socket.IO endpoints
models/         Mongoose models: User, Conversation, RegistrationOTP
lib/            database connection, JWT, encryption, email templates
middleware.ts   redirects signed-out users to /login and signed-in users to /dashboard
```

## Getting started

You need Node.js 18 or newer, a MongoDB database (local or [MongoDB Atlas](https://www.mongodb.com/atlas)) and an SMTP account for sending codes.

```bash
git clone https://github.com/zavliv/ChatX.git
cd ChatX
npm install
```

Create `.env.local`:

```bash
MONGODB_URI=mongodb+srv://USER:PASSWORD@CLUSTER.mongodb.net/chatx
JWT_SECRET=a-long-random-string
SMTP_HOST=smtp.example.com
SMTP_PORT=465
SMTP_USER=you@example.com
SMTP_PASS=your-smtp-password
SMTP_FROM=ChatX <you@example.com>
ENCRYPTION_KEY=64-hex-characters      # openssl rand -hex 32
ENCRYPTION_IV=32-hex-characters       # openssl rand -hex 16
SERVER_URL=http://localhost:3000
```

Then run:

```bash
npm run dev
```

and open http://localhost:3000.

## API

| Route | Purpose |
| --- | --- |
| `POST /api/auth/generate-register-otp` | Email a sign-up code |
| `POST /api/auth/register` | Create the account with the code |
| `POST /api/auth/login` | Sign in and receive a session token |
| `GET /api/user/me` | The signed-in user |
| `GET /api/chat/users` | People you can start a conversation with |
| `GET /api/chat/conversations` | Your conversations |
| `POST /api/chat/conversation` | Start a conversation |
| `GET /api/chat/getMessages` | Messages in a conversation |
| `POST /api/chat/message` | Send a message |
| `POST /api/chat/read` | Mark messages as read |
| `POST /api/chat/upload` | Upload an attachment |
| `/api/socketio` | Socket.IO connection |

## Notes

- **Set your own `ENCRYPTION_KEY` and `ENCRYPTION_IV`.** The code has built-in fallback values for development; never run it without your own.
- **Uploads are stored on disk** in `public/uploads/chat-uploads/`, so the app needs a server with a persistent disk (a VPS, for example), not a serverless host.
- Socket.IO runs inside the Next.js server, so deploy it as a long-running Node.js process (`npm run build && npm start`).
