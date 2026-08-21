import type {
  PermissionGroupKey,
  ProjectRoleDefinition,
  RolePermissions,
  RolePreset,
} from "../types/roles";

export const ROLE_LEVELS = [
  { value: 20, label: "Viewer" },
  { value: 40, label: "Member" },
  { value: 60, label: "Team Lead" },
  { value: 80, label: "Project Manager" },
  { value: 100, label: "Reserved System" },
] as const;

export const CUSTOM_ROLE_LEVEL_MIN = 1;
export const CUSTOM_ROLE_LEVEL_MAX = 99;
export const CUSTOM_ROLE_LEVELS = ROLE_LEVELS.filter(
  (roleLevel) => roleLevel.value <= CUSTOM_ROLE_LEVEL_MAX,
);

export const EMPTY_ROLE_PERMISSIONS: RolePermissions = {
  project: {
    read: true,
    updateSettings: false,
    deleteProject: false,
  },
  members: {
    invite: false,
    remove: false,
    changeRoles: false,
  },
  tasks: {
    create: false,
    read: true,
    update: false,
    delete: false,
    assign: false,
  },
  workshop: {
    read: true,
    createNodes: false,
    updateNodes: false,
    deleteNodes: false,
    generateWithAi: false,
  },
  board: {
    read: true,
    moveTasks: false,
    manageColumns: false,
  },
  roles: {
    create: false,
    update: false,
    delete: false,
  },
  chat: {
    read: true,
    send: false,
    pin: false,
    deleteAny: false,
    sendAnnouncement: false,
  },
};

const FULL_PERMISSIONS: RolePermissions = {
  project: {
    read: true,
    updateSettings: true,
    deleteProject: true,
  },
  members: {
    invite: true,
    remove: true,
    changeRoles: true,
  },
  tasks: {
    create: true,
    read: true,
    update: true,
    delete: true,
    assign: true,
  },
  workshop: {
    read: true,
    createNodes: true,
    updateNodes: true,
    deleteNodes: true,
    generateWithAi: true,
  },
  board: {
    read: true,
    moveTasks: true,
    manageColumns: true,
  },
  roles: {
    create: true,
    update: true,
    delete: true,
  },
  chat: {
    read: true,
    send: true,
    pin: true,
    deleteAny: true,
    sendAnnouncement: true,
  },
};

export const ROLE_PERMISSION_GROUPS: Array<{
  key: PermissionGroupKey;
  label: string;
  description: string;
  permissions: Array<{
    key: string;
    label: string;
    description: string;
    dangerous?: boolean;
  }>;
}> = [
  {
    key: "project",
    label: "Project",
    description: "Project visibility and settings controls.",
    permissions: [
      {
        key: "read",
        label: "Read project",
        description: "View project details and shared context.",
      },
      {
        key: "updateSettings",
        label: "Update settings",
        description: "Change project name, description, and color.",
      },
      {
        key: "deleteProject",
        label: "Delete project",
        description: "Allow permanent deletion of the project.",
        dangerous: true,
      },
    ],
  },
  {
    key: "members",
    label: "Members",
    description: "Team access and invitation controls.",
    permissions: [
      {
        key: "invite",
        label: "Invite members",
        description: "Send invitations to new project teammates.",
      },
      {
        key: "remove",
        label: "Remove members",
        description: "Remove existing teammates from the project.",
        dangerous: true,
      },
      {
        key: "changeRoles",
        label: "Change roles",
        description: "Assign roles to project members.",
      },
    ],
  },
  {
    key: "tasks",
    label: "Tasks",
    description: "Task creation, ownership, and delivery controls.",
    permissions: [
      {
        key: "create",
        label: "Create tasks",
        description: "Add tasks to the team board.",
      },
      {
        key: "read",
        label: "Read tasks",
        description: "View task cards and task details.",
      },
      {
        key: "update",
        label: "Update tasks",
        description: "Edit task content within hierarchy scope.",
      },
      {
        key: "delete",
        label: "Delete tasks",
        description: "Delete task cards within hierarchy scope.",
        dangerous: true,
      },
      {
        key: "assign",
        label: "Assign tasks",
        description: "Assign work to project members.",
      },
    ],
  },
  {
    key: "workshop",
    label: "Workshop",
    description: "Main workshop node and AI planning controls.",
    permissions: [
      {
        key: "read",
        label: "Read workshop",
        description: "View shared workshop content.",
      },
      {
        key: "createNodes",
        label: "Create nodes",
        description: "Add notes, task cards, images, and sections.",
      },
      {
        key: "updateNodes",
        label: "Update nodes",
        description: "Edit workshop content within hierarchy scope.",
      },
      {
        key: "deleteNodes",
        label: "Delete nodes",
        description: "Delete workshop content within hierarchy scope.",
        dangerous: true,
      },
      {
        key: "generateWithAi",
        label: "Generate with AI",
        description: "Use AI planning tools in the workshop.",
      },
    ],
  },
  {
    key: "board",
    label: "Board",
    description: "Kanban board movement and column controls.",
    permissions: [
      {
        key: "read",
        label: "Read board",
        description: "View the team board.",
      },
      {
        key: "moveTasks",
        label: "Move tasks",
        description: "Move cards between board columns.",
      },
      {
        key: "manageColumns",
        label: "Manage columns",
        description: "Create, rename, reorder, or remove columns.",
      },
    ],
  },
  {
    key: "roles",
    label: "Roles",
    description: "Role creation and permission model controls.",
    permissions: [
      {
        key: "create",
        label: "Create roles",
        description: "Create custom project roles.",
      },
      {
        key: "update",
        label: "Update roles",
        description: "Edit custom role details and permissions.",
      },
      {
        key: "delete",
        label: "Delete roles",
        description: "Delete custom roles when they are not assigned.",
        dangerous: true,
      },
    ],
  },
  {
    key: "chat",
    label: "Chat",
    description: "Project chat, announcements, pinning, and message moderation.",
    permissions: [
      {
        key: "read",
        label: "Read chat",
        description: "View and read project chat messages.",
      },
      {
        key: "send",
        label: "Send messages",
        description: "Send chat messages, replies, attachments, and reactions.",
      },
      {
        key: "pin",
        label: "Pin messages",
        description: "Pin important messages to the project chat.",
      },
      {
        key: "deleteAny",
        label: "Delete any message",
        description: "Delete other members' messages.",
        dangerous: true,
      },
      {
        key: "sendAnnouncement",
        label: "Post announcements",
        description: "Broadcast special project announcements.",
      },
    ],
  },
];

export const ROLE_PRESETS: RolePreset[] = [
  {
    id: "owner-admin",
    name: "Full Access",
    description: "Full control over project settings, people, work, and AI.",
    level: 100,
    permissions: FULL_PERMISSIONS,
  },
  {
    id: "project-manager",
    name: "Project Manager",
    description: "Manage members, tasks, board flow, and workshop planning.",
    level: 80,
    permissions: {
      ...FULL_PERMISSIONS,
      project: { read: true, updateSettings: true, deleteProject: false },
    },
  },
  {
    id: "team-lead",
    name: "Team Lead",
    description: "Coordinate assigned work and manage lower-level content.",
    level: 60,
    permissions: {
      project: { read: true, updateSettings: false, deleteProject: false },
      members: { invite: false, remove: false, changeRoles: false },
      tasks: {
        create: true,
        read: true,
        update: true,
        delete: true,
        assign: true,
      },
      workshop: {
        read: true,
        createNodes: true,
        updateNodes: true,
        deleteNodes: true,
        generateWithAi: false,
      },
      board: { read: true, moveTasks: true, manageColumns: false },
      roles: { create: false, update: false, delete: false },
      chat: {
        read: true,
        send: true,
        pin: true,
        deleteAny: false,
        sendAnnouncement: false,
      },
    },
  },
  {
    id: "member",
    name: "Member",
    description: "Create and update assigned work in the project workspace.",
    level: 40,
    permissions: {
      project: { read: true, updateSettings: false, deleteProject: false },
      members: { invite: false, remove: false, changeRoles: false },
      tasks: {
        create: true,
        read: true,
        update: true,
        delete: false,
        assign: false,
      },
      workshop: {
        read: true,
        createNodes: true,
        updateNodes: true,
        deleteNodes: false,
        generateWithAi: false,
      },
      board: { read: true, moveTasks: true, manageColumns: false },
      roles: { create: false, update: false, delete: false },
      chat: {
        read: true,
        send: true,
        pin: false,
        deleteAny: false,
        sendAnnouncement: false,
      },
    },
  },
  {
    id: "viewer",
    name: "Viewer",
    description: "Read-only access to project content and progress.",
    level: 20,
    permissions: EMPTY_ROLE_PERMISSIONS,
  },
];

export const DEFAULT_PROJECT_ROLES: ProjectRoleDefinition[] = ROLE_PRESETS.map(
  (preset, index) => ({
    ...preset,
    id: `role-${preset.id}`,
    isSystemRole: index === 0,
    memberCount: [1, 2, 3, 4, 1][index],
  }),
);
