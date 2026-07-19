// src/lib/socket/constants/socket-events.ts

export const SOCKET_EVENTS = {
    // Connection
    CONNECTION: {
        CONNECT: "connect",
        DISCONNECT: "disconnect",
        CONNECT_ERROR: "connect_error",
        CONNECT_TIMEOUT: "connect_timeout",
        RECONNECT: "reconnect",
        RECONNECT_ATTEMPT: "reconnect_attempt",
        RECONNECT_FAILED: "reconnect_failed",
        // RECONNECT_ERROR: "reconnect_error",
    },

    // Client → Server
    PROJECT: {
        JOIN: 'project:join',
        LEAVE: 'project:leave',
    },

    // Tasks
    TASK: {
        CREATED: 'task:created',
        UPDATED: 'task:updated',
        DELETED: 'task:deleted',
    },

    // Subtasks
    SUBTASK: {
        CREATED: 'subtask:created',
        UPDATED: 'subtask:updated',
        DELETED: 'subtask:deleted',
    },

    // Columns
    COLUMN: {
        CREATED: 'column:created',
        UPDATED: 'column:updated',
        DELETED: 'column:deleted',
        REORDERED: 'column:reordered',
    },

    // Comments
    COMMENT: {
        CREATED: 'comment:created',
        UPDATED: 'comment:updated',
        DELETED: 'comment:deleted',
    },

    // Notifications
    NOTIFICATION: {
        NEW: 'notification:new',
        READ_ALL: 'notification:read-all',
    },

    // Activity
    ACTIVITY: {
        NEW: 'activity:new',
    },

    // Presence
    PRESENCE: {
        USER_ONLINE: 'user:online',
        USER_OFFLINE: 'user:offline',
    },
} as const;