# CHAT Frontend Contract

Project-Scoped Group Chat & Announcements — Backend ↔ Frontend integration contract.

**Last updated:** 2026-08-20

---

## 1. Overview

The backend exposes a project-scoped chat with:

- Text messages and **announcements** (`type: 'ANNOUNCEMENT'`).
- Reply threads (a message can reference a `parentMessageId`).
- Attachments (images / files, up to **10 MB each**, max **5 per message**).
- Pinning, emoji reactions, unread counts, and per-user read receipts.
- Real-time delivery through the existing Socket.io gateway (project rooms).

All chat routes are protected by `JwtAuthGuard` + `ProjectAuthGuard` and scoped to a
project. Membership in the project is always required. Mutating endpoints additionally
require a valid CSRF token.

---

## 2. Base URL & Global Conventions

- REST base: `{API_URL}/api` (global `/api` prefix).
- Socket.io base: `{API_URL}` (same origin, no `/api` prefix).

### 2.1 Authentication

- Cookie-based: the backend sets `access_token` and `refresh_token` (httpOnly).
- After `POST /api/auth/login` or `/api/auth/signup`, the response body contains the
  `csrfToken` that must be used for this session:
  ```json
  { "success": true, "message": "Login successful.", "data": { "user": { ... }, "csrfToken": "..." } }
  ```
- The CSRF token is also available from `GET /api/auth/me` (`data.csrfToken`).

### 2.2 CSRF requirements

For **every non-GET request** (`POST`, `PATCH`, `DELETE`):

- Read `csrfToken` from the login/signup response (or `/auth/me`).
- Send it in the header `x-csrf-token`.
- The backend compares it against the `csrf_token` cookie. Mismatch → `403`.

```ts
// axios example
axios.post(url, body, { headers: { 'x-csrf-token': csrfToken } });
```

### 2.3 Envelope

All HTTP responses use the standard envelope:

```ts
interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  statusCode: number;
  data: T;
}
```

Errors use the standard error shape (see §8).

---

## 3. REST API

Routes are grouped under `projects/:projectId/chat`.

### 3.1 `GET /api/projects/:projectId/chat/messages`

Paginated message history (newest first). Cursor-based keyset pagination.

**Query params** (all optional):

| Param    | Type      | Description                                                      |
|----------|-----------|------------------------------------------------------------------|
| `limit`  | `number`  | Default `50`, max `100`.                                         |
| `cursor` | `uuid`    | Pass the `nextCursor` from the previous page to load older messages. |
| `search` | `string`  | Case-insensitive substring filter on message content.            |
| `type`   | `enum`    | `STANDARD` \| `ANNOUNCEMENT` \| `SYSTEM`.                        |
| `pinned` | `boolean` | `true` → only pinned messages.                                   |

**Permission required:** `chat.read` (all project members).

**200 response:**
```json
{
  "success": true,
  "message": "Messages retrieved successfully.",
  "data": {
    "messages": [ /* ChatMessage[], see §4 */ ],
    "nextCursor": "uuid-or-null",
    "hasMore": false
  }
}
```

### 3.2 `POST /api/projects/:projectId/chat/messages`

Send a message or announcement.

**Permission required:** `chat.send` (+ `chat.sendAnnouncement` when `type = 'ANNOUNCEMENT'`).

**Request body:**
```json
{
  "content": "Hello team",
  "type": "STANDARD",              // optional, default STANDARD
  "parentMessageId": "uuid",       // optional — reply to a message
  "attachments": [                 // optional, max 5
    { "fileName": "x.png", "fileUrl": "https://...", "fileType": "image/png", "fileSize": 2048, "storagePath": "chat/{projectId}/..." }
  ]
}
```

At least one of `content` (non-empty) or `attachments` is required, otherwise `400`.

**200 response:** `data` is a `ChatMessage` (see §4).

### 3.3 `GET /api/projects/:projectId/chat/messages/pinned`

All pinned messages (ordered by most recently pinned first).

**Permission required:** `chat.read`.

**200 response:** `data` is an array of `ChatMessage`.

### 3.4 `GET /api/projects/:projectId/chat/messages/unread-count`

Unread message count for the requesting member.

**Permission required:** `chat.read`.

**200 response:**
```json
{ "success": true, "message": "Unread count retrieved successfully.", "data": { "unreadCount": 12 } }
```

### 3.5 `POST /api/projects/:projectId/chat/messages/read`

Mark messages as read. Pass a `messageId` to mark everything up to (and including) that
message as read, or omit it to mark everything up to "now" as read.

**Permission required:** `chat.read`.

**Request body (optional):**
```json
{ "messageId": "uuid" }
```

**200 response:**
```json
{ "success": true, "message": "Messages marked as read.", "data": { "lastReadAt": "ISO-8601", "lastReadMessageId": "uuid-or-null" } }
```

### 3.6 `POST /api/projects/:projectId/chat/messages/attachments`

Upload attachments **before** sending a message. Multipart/form-data.

- Field name: `files` (array).
- Max **10 MB** per file, max **5** files per request.
- Disallowed extensions (`.exe`, `.bat`, `.cmd`, `.sh`, `.php`, `.js`, `.vbs`) are rejected with `400`.

**Permission required:** `chat.send`.

**200 response:** the returned objects are passed straight into
`POST /api/projects/:projectId/chat/messages` under `attachments`:
```json
{
  "success": true,
  "message": "Attachment(s) uploaded successfully.",
  "data": {
    "attachments": [
      { "fileName": "x.png", "fileUrl": "https://...", "fileType": "image/png", "fileSize": 2048, "storagePath": "chat/{projectId}/..." }
    ]
  }
}
```

> Note: `storagePath` is internal and only returned so the client can attach it to a
> message. It is never rendered to end users.

### 3.7 `GET /api/projects/:projectId/chat/messages/:messageId`

Fetch a single message including reactions and attachments.

**Permission required:** `chat.read`.

**200 response:** `data` is a `ChatMessage`.

### 3.8 `PATCH /api/projects/:projectId/chat/messages/:messageId`

Edit **own** message content. Sets `isEdited = true`, `editedAt = now`.

**Permission required:** `chat.send` + must be the author.

**Request body:**
```json
{ "content": "Updated text" }
```

**200 response:** `data` is the updated `ChatMessage`.

### 3.9 `DELETE /api/projects/:projectId/chat/messages/:messageId`

Hard-delete a message (attachments removed from storage too).

Allowed for:

- the **author**, or
- members with `chat.deleteAny` **and** a higher role level than the author.

**Permission required:** `chat.send`.

**200 response:** `{ success, message, statusCode }` (no `data`).

### 3.10 `POST /api/projects/:projectId/chat/messages/:messageId/pin`

Pin / unpin a message. Omit `pinned` to **toggle**.

**Permission required:** `chat.pin`.

**Request body (optional):**
```json
{ "pinned": true }
```

**200 response:** `data` is the updated `ChatMessage` (`isPinned` reflects the new state).

### 3.11 `POST /api/projects/:projectId/chat/messages/:messageId/reactions`

Add an emoji reaction. Adding the same emoji twice is a no-op.

**Permission required:** `chat.read`.

**Request body:**
```json
{ "emoji": "👍" }
```

**200 response:** `{ success, message, statusCode }`.

### 3.12 `DELETE /api/projects/:projectId/chat/messages/:messageId/reactions/:emoji`

Remove **own** reaction for the given emoji.

**Permission required:** `chat.read`.

**Note:** the `emoji` path segment must be URL-encoded by the client, e.g.
`encodeURIComponent('👍')` → `%F0%9F%91%8D`.

**200 response:** `{ success, message, statusCode }`.

---

## 4. `ChatMessage` type

```ts
export enum ChatMessageType {
  STANDARD = 'STANDARD',
  ANNOUNCEMENT = 'ANNOUNCEMENT',
  SYSTEM = 'SYSTEM',
}

export interface ChatSender {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
}

export interface ChatAttachment {
  id: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  createdAt: string; // ISO-8601
}

export interface ChatReaction {
  id: string;
  emoji: string;
  user: ChatSender;
}

export interface ChatMessage {
  id: string;
  projectId: string;
  sender: ChatSender;
  content: string;
  type: ChatMessageType;
  isPinned: boolean;
  pinnedBy: ChatSender | null;
  pinnedAt: string | null;
  parentMessageId: string | null;
  isEdited: boolean;
  editedAt: string | null;
  attachments: ChatAttachment[];
  reactions: ChatReaction[];
  createdAt: string; // ISO-8601
  updatedAt: string; // ISO-8601
}
```

---

## 5. Permission Model (role matrix)

The `chat` permission category is part of `RolePermissions`:

```ts
chat: {
  read: boolean;
  send: boolean;
  pin: boolean;
  deleteAny: boolean;
  sendAnnouncement: boolean;
}
```

| Role           | read | send | pin | deleteAny | sendAnnouncement |
|----------------|:----:|:----:|:---:|:---------:|:----------------:|
| Admin (100)    |  ✅  |  ✅  | ✅  |    ✅     |        ✅        |
| Project Mgr (80)|  ✅  |  ✅  | ✅  |    ✅     |        ✅        |
| Team Lead (60) |  ✅  |  ✅  | ✅  |    ❌     |        ❌        |
| Member (40)    |  ✅  |  ✅  | ❌  |    ❌     |        ❌        |
| Viewer (20)    |  ✅  |  ❌  | ❌  |    ❌     |        ❌        |

UI guidance:

- Hide the composer for members without `chat.send` (Viewers).
- Hide the "announce" toggle for members without `chat.sendAnnouncement`.
- Show pin / delete-others controls only when the corresponding permission is present.

---

## 6. Real-Time (Socket.io)

### 6.1 Connection & authentication

Connect with the same cookie session (or pass the access token via `auth`):

```ts
import { io } from 'socket.io-client';

const socket = io(API_URL, {
  withCredentials: true,
  // alt: { auth: { token: accessToken } }
});
```

### 6.2 Joining a project room

```ts
socket.emit('project:join', { projectId });
// leave: socket.emit('project:leave', { projectId });
```

The gateway validates membership before joining. The same `project:${projectId}` room
carries all chat events (and existing task/column/comment events).

### 6.3 Events the server sends (listen on these)

| Event                     | Payload (`data`)                                            |
|---------------------------|-------------------------------------------------------------|
| `chat:message:created`    | `{ projectId, message: ChatMessage }`                       |
| `chat:message:updated`    | `{ projectId, message: ChatMessage }`                       |
| `chat:message:deleted`    | `{ projectId, messageId, type }`                            |
| `chat:message:pinned`     | `{ projectId, message: ChatMessage }`                       |
| `chat:message:unpinned`   | `{ projectId, message: ChatMessage }`                       |
| `chat:reaction:added`     | `{ projectId, messageId, emoji, userId }`                   |
| `chat:reaction:removed`   | `{ projectId, messageId, emoji, userId }`                   |
| `chat:user:typing`        | `{ projectId, userId, userName, avatarUrl, isTyping }`      |
| `chat:read`               | `{ projectId, userId, lastReadAt, lastReadMessageId }`      |

```ts
socket.on('chat:message:created', ({ projectId, message }) => {
  if (message.projectId === activeProjectId) prependMessage(message);
});

socket.on('chat:user:typing', (typing) => {
  // typing.userId is NOT the local user (server excludes the sender).
  setTyping(typing.userId, typing.isTyping);
});
```

### 6.4 Events the client sends

| Event        | Payload                         | Notes                                                        |
|--------------|---------------------------------|--------------------------------------------------------------|
| `chat:typing`| `{ projectId, isTyping: boolean }` | Throttled server-side (~800 ms). Fire on input change; send `isTyping: false` when the user stops / on blur. |

> The server never echoes a user's own typing to them; only other members in the room
> receive `chat:user:typing`.

### 6.5 Recommended client flow

1. Connect → `project:join` on project open.
2. Load history via `GET .../chat/messages` and merge `chat:message:created` events.
3. On sending, optimistically append locally, then reconcile with the realtime event.
4. On `chat:message:updated` / `:deleted` / pin events, update the matching message by `id`.
5. On `chat:reaction:*`, update the reaction list of `messageId` locally (server does not
   re-send the full message on reactions).
6. Emit `chat:typing` with `isTyping:false` shortly after the last keystroke (client-side debounce ~1 s).

---

## 7. Error Responses

Errors use the standard filter output, e.g.:

```json
{
  "success": false,
  "message": "You do not have permission to perform this action (chat.send)",
  "statusCode": 403
}
```

| HTTP | Likely cause                                                  |
|------|---------------------------------------------------------------|
| 400  | Invalid body / invalid cursor / empty message / parent not in project |
| 401  | Not authenticated                                             |
| 403  | Not a member, missing permission, editing/deleting others' messages, invalid CSRF |
| 404  | Message not found in project, user not found                  |
| 413  | File(s) exceed 10 MB or total body limit                      |

---

## 8. Notes & Edge Cases

- **URL-encoding:** always `encodeURIComponent` the `:emoji` path segment.
- **Replies:** `parentMessageId` must reference a message in the same project.
- **Deletion:** deleting a parent message nulls the parent link on replies; replies remain.
- **Editing:** only the author may edit. Editing marks the message with `isEdited`.
- **Unread baseline:** for members who have never read, unread counts start from their
  membership join date.
- **Announcements:** these are `ChatMessage` rows with `type: 'ANNOUNCEMENT'`. Use the
  `type` query filter to build a "news" view. Only Admin / Project Manager can post them.