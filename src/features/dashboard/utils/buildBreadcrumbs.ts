export interface BreadcrumbSegment {
  label: string;
  href?: string;
}

interface BuildBreadcrumbsOptions {
  projectId?: string;
  projectName?: string;
}

export function buildBreadcrumbs(
  pathname: string,
  options: BuildBreadcrumbsOptions = {},
): BreadcrumbSegment[] {
  const crumbs: BreadcrumbSegment[] = [{ label: "Bridge", href: "/dashboard" }];

  const segments = pathname.split("/").filter(Boolean);
  const projectOverviewHref = options.projectId
    ? `/projects/${options.projectId}`
    : undefined;

  const labelMap: Record<string, string> = {
    dashboard: "Dashboard",
    projects: "Projects",
    new: "New Project",
    workshop: "Main Workshop",
    boards: "Team Board",
    knowledge: "Knowledge & AI Rules",
    settings: "Settings",
    "my-workspace": "My Workspace",
  };

  let accumulated = "";

  segments.forEach((seg, idx) => {
    accumulated += `/${seg}`;
    const isLast = idx === segments.length - 1;
    const isProjectRoute = seg === "projects" && projectOverviewHref;

    const isId =
      seg.length > 20 || /^[0-9a-f-]{36}$/.test(seg) || /^\d+$/.test(seg);

    if (isId) return;

    if (isProjectRoute) {
      crumbs.push({
        label: options.projectName ?? "Project",
        href: projectOverviewHref,
      });
      return;
    }

    const label = labelMap[seg] ?? seg.charAt(0).toUpperCase() + seg.slice(1);
    crumbs.push({ label, href: isLast ? undefined : accumulated });
  });

  return crumbs;
}
