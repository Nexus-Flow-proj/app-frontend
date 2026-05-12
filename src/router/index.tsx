import { lazy } from "react";
import { createBrowserRouter, Navigate } from "react-router";
import WithSuspense from "@/components/hoc/WithSuspense";
import AuthLayout from "@/features/auth/layout";
import { GuestGuard } from "./GuestGuard";
import { AuthGuard } from "./AuthGuard";
import { AdminGuard } from "./AdminGuard";
import { MemberGuard } from "./MemberGuard";
import DashboardLayout from "@/layouts/DashboardLayout";
import ProjectLayout from "@/layouts/ProjectLayout";

// ** ──────────────── Lazy page imports ───────────────────────────

// ** AuthPages
const AuthPages = {
  Login: lazy(() => import("@/features/auth/pages/LoginPage")),
  Register: lazy(() => import("@/features/auth/pages/RegisterPage")),
  ForgotPassword: lazy(
    () => import("@/features/auth/pages/ForgotPasswordPage"),
  ),
  ResetPassword: lazy(() => import("@/features/auth/pages/ResetPasswordPage")),
  InviteAccept: lazy(() => import("@/features/auth/pages/InviteAcceptPage")),
  NotFound: lazy(() => import("@/features/auth/pages/NotFound")),
};

// ** Dashboard Pages
const DashboardPages = {
  Dashboard: lazy(() => import("@/features/dashboard/pages/DashboardPage")),
};

// ** Project Pages
const ProjectPages = {
  Create: lazy(() => import("@/features/project/pages/CreateProjectPage")),
  Settings: lazy(() => import("@/features/project/pages/ProjectSettingsPage")),
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
            path: "register",
            element: <WithSuspense Component={AuthPages.Register} />,
          },
          {
            path: "forgot-password",
            element: <WithSuspense Component={AuthPages.ForgotPassword} />,
          },
        ],
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
      {
        path: "invite/:token",
        element: <WithSuspense Component={AuthPages.InviteAccept} />,
      },
    ],
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

          // ── Project-scoped pages ────────────────────────────────────────
          // ProjectLayout loads project + members into store before children render.
          // This means AdminGuard / MemberGuard always have role data available.
          {
            path: "/projects/:id",
            element: <ProjectLayout />,
            children: [
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
                    element: <WithSuspense Component={ProjectPages.Settings} />,
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
                    path: "my-workshop",
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
