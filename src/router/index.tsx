import { lazy } from "react";
import { createBrowserRouter, Navigate } from "react-router";
import WithSuspense from "@/components/hoc/WithSuspense";
import { GuestGuard } from "./GuestGuard";
import { AuthGuard } from "./AuthGuard";
import { AdminGuard } from "./AdminGuard";
import { MemberGuard } from "./MemberGuard";
import DashboardLayout from "@/features/dashboard/layout";
import AuthLayout from "@/features/auth/layout";

// ** ──────────────── Lazy page imports ───────────────────────────

// ** AuthPages
const AuthPages = {
  Login: lazy(() => import("@/features/auth/pages/LoginPage")),
  Register: lazy(() => import("@/features/auth/pages/RegisterPage")),
  ForgotPassword: lazy(
    () => import("@/features/auth/pages/ForgotPasswordPage"),
  ),
  ResetPassword: lazy(() => import("@/features/auth/pages/ResetPasswordPage")),
  NotFound: lazy(() => import("@/features/auth/pages/NotFound")),
};

// ** Dashboard Pages
const DashboardPages = {
  Dashboard: lazy(() => import("@/features/dashboard/pages/DashboardPage")),
};

// ** Project Pages
const ProjectPages = {
  Overview: lazy(() => import("@/features/project/pages/ProjectOverviewPage")),
  Create: lazy(() => import("@/features/project/pages/CreateProjectPage")),
  Invitation: lazy(
    () => import("@/features/project/pages/ProjectInvitationPage"),
  ),
  Members: lazy(() => import("@/features/project/pages/ProjectMembersPage")),
  Settings: lazy(() => import("@/features/project/pages/ProjectSettingsPage")),
  Roles: lazy(() => import("@/features/project/pages/ProjectRolesPage")),
};

// ** Workshop Pages
const WorkshopPages = {
  MainWorkshop: lazy(() => import("@/features/workshop/pages/WorkshopPage")),
  MiniWorkshop: lazy(
    () => import("@/features/mini-workshop/pages/MiniWorkshopPage"),
  ),
};

// ** Board Pages
const BoardPages = {
  TeamBoard: lazy(() => import("@/features/boards/pages/BoardsPage")),
};

// ** ───────────────────────────  Router ───────────────────────────
const router = createBrowserRouter([
  // ── Root redirect
  {
    index: true,
    path: "/",
    element: <Navigate to="/dashboard" replace />,
  },

  // ── Public (guest-only) routes
  {
    element: <GuestGuard />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          {
            path: "login",
            element: <WithSuspense Component={AuthPages.Login} />,
          },
          {
            path: "forgot-password",
            element: <WithSuspense Component={AuthPages.ForgotPassword} />,
          },
        ],
      },
      {
        path: "register",
        element: <WithSuspense Component={AuthPages.Register} />,
      },
    ],
  },

  // ── Public (any user) routes
  {
    element: <AuthLayout />,
    children: [
      {
        path: "reset-password",
        element: <WithSuspense Component={AuthPages.ResetPassword} />,
      },
    ],
  },
  {
    path: "project/invitation/:token",
    element: <WithSuspense Component={ProjectPages.Invitation} />,
  },

  // ── Auth-required routes
  {
    element: <AuthGuard />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          // ── Global authenticated pages ──────────────────────────────────
          {
            path: "/dashboard",
            index: true,
            element: <WithSuspense Component={DashboardPages.Dashboard} />,
          },
          {
            path: "/projects/new",
            element: <WithSuspense Component={ProjectPages.Create} />,
          },
          {
            path: "/projects/:id",
            children: [
              {
                index: true,
                element: <WithSuspense Component={ProjectPages.Overview} />,
              },
              {
                // Admin-only pages
                element: <AdminGuard />,
                children: [
                  {
                    path: "workshop",
                    element: (
                      <WithSuspense Component={WorkshopPages.MainWorkshop} />
                    ),
                  },
                  {
                    path: "settings",
                    element: (
                      <WithSuspense Component={ProjectPages.Settings} />
                    ),
                  },
                  {
                    path: "members",
                    element: <WithSuspense Component={ProjectPages.Members} />,
                  },
                  {
                    path: "roles",
                    element: <WithSuspense Component={ProjectPages.Roles} />,
                  },
                ],
              },

              // Member routes
              {
                element: <MemberGuard />,
                children: [
                  {
                    path: "boards",
                    element: <WithSuspense Component={BoardPages.TeamBoard} />,
                  },
                  {
                    path: "my-workspace",
                    element: (
                      <WithSuspense Component={WorkshopPages.MiniWorkshop} />
                    ),
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },

  // ── 404
  {
    path: "*",
    element: <WithSuspense Component={AuthPages.NotFound} />,
  },
]);

export default router;
