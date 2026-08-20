import { useMemo } from "react";
import type { PlanTier } from "../types";
import { useMySubscription } from "./useMySubscription";

export interface ProjectPrivileges {
  projectOwnerTier: PlanTier;
  userPlanTier: PlanTier;
  canUseCustomRoles: boolean;
  canUseKnowledgeBase: boolean;
  hasUnlimitedAi: boolean;
  maxBoardColumns: number | null;
  maxMembers: number | null;
  maxTasks: number | null;
  maxKnowledgeChunks: number | null;
  isProjectOwnerPro: boolean;
  isProjectOwnerBusiness: boolean;
  isUserPro: boolean;
  isUserBusiness: boolean;
}

export function useProjectPrivileges(
  projectOwnerTier: PlanTier = "FREE",
): ProjectPrivileges {
  const { data: subscription } = useMySubscription();

  const userPlanTier: PlanTier = subscription?.plan?.tier ?? "FREE";

  return useMemo<ProjectPrivileges>(() => {
    const isProjectOwnerPro =
      projectOwnerTier === "PRO" || projectOwnerTier === "BUSINESS";
    const isProjectOwnerBusiness = projectOwnerTier === "BUSINESS";

    const isUserPro = userPlanTier === "PRO" || userPlanTier === "BUSINESS";
    const isUserBusiness = userPlanTier === "BUSINESS";

    const canUseCustomRoles = isProjectOwnerPro;
    const canUseKnowledgeBase = isProjectOwnerPro;
    // Unlimited AI if project is owned by a Business tier or if the user themselves is Business tier
    const hasUnlimitedAi = isProjectOwnerBusiness || isUserBusiness;

    const maxBoardColumns =
      projectOwnerTier === "FREE"
        ? 3
        : null; // null means unlimited

    const maxMembers =
      projectOwnerTier === "FREE" || projectOwnerTier === "PRO"
        ? 5
        : null; // null means unlimited

    const maxTasks =
      projectOwnerTier === "FREE"
        ? 100
        : projectOwnerTier === "PRO"
          ? 2000
          : null; // null means unlimited

    const maxKnowledgeChunks =
      projectOwnerTier === "FREE"
        ? 0
        : projectOwnerTier === "PRO"
          ? 40
          : null; // null means unlimited

    return {
      projectOwnerTier,
      userPlanTier,
      canUseCustomRoles,
      canUseKnowledgeBase,
      hasUnlimitedAi,
      maxBoardColumns,
      maxMembers,
      maxTasks,
      maxKnowledgeChunks,
      isProjectOwnerPro,
      isProjectOwnerBusiness,
      isUserPro,
      isUserBusiness,
    };
  }, [projectOwnerTier, userPlanTier]);
}
