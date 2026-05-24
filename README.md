# Worknoon Chat - Frontend

A modern real-time chat UI built with Next.js, Tailwind CSS, and Socket.IO client.

---

## Tech Stack

- Next.js
- Tailwind CSS
- Socket.IO Client
- Axios
- Zustand (state management)
- React Hot Toast

---

## Features

- User authentication (login/register)
- Real-time messaging
- Conversation inbox system
- Typing indicators
- Online users indicator
- Responsive UI (mobile + desktop)
- Role-based chat support UI
- Floating chat widget (WordPress integration)

---

## Project Structure

````

src/
├── app/
├── components/
├── lib/
├── store/
├── services/

````

---

## Setup Instructions

### 1. Install dependencies

```bash
npm install
````

### 2. Run development server

```bash
npm run dev
```

### 3. Environment

Backend must run on:

```
http://localhost:5000
```

---

## API Integration

All API calls use Axios instance with JWT token:

* `/api/auth`
* `/api/conversations`
* `/api/messages`

---

## Socket Events

* `setup`
* `joinConversation`
* `sendMessage`
* `typing`
* `stopTyping`
* `onlineUsers`
* `newMessage`

---

## UI Features

* Responsive chat layout
* Sidebar + chat window design
* Mobile adaptive navigation
* Auto-scroll to latest messages
* Empty and loading states

---

## Key Highlights

* Real-time architecture using Socket.IO
* Clean separation of API and UI logic
* Scalable chat UI design inspired by modern SaaS tools
* WordPress embed support via iframe widget

---

## Demo
https://www.loom.com/share/bfe4457672a14de3bc6126eaa396cf59

---

## Notes

Frontend can be:

* used standalone
* embedded inside WordPress plugin
* extended into full SaaS dashboard
