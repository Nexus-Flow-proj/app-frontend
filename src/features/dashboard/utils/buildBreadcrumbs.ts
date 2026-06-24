export interface BreadcrumbSegment {
  label: string;
  href?: string;
}

export function buildBreadcrumbs(pathname: string): BreadcrumbSegment[] {
  const crumbs: BreadcrumbSegment[] = [
    { label: "Nexus-Flow", href: "/dashboard" },
  ];

  const segments = pathname.split("/").filter(Boolean);

  const labelMap: Record<string, string> = {
    dashboard: "Dashboard",
    projects: "Projects",
    new: "New Project",
    workshop: "Main Workshop",
    boards: "Team Board",
    settings: "Settings",
    "my-workspace": "My Workspace",
  };

  let accumulated = "";

  segments.forEach((seg, idx) => {
    accumulated += `/${seg}`;
    const isLast = idx === segments.length - 1;

    const isId =
      seg.length > 20 || /^[0-9a-f-]{36}$/.test(seg) || /^\d+$/.test(seg);

    if (isId) return;

    const label = labelMap[seg] ?? seg.charAt(0).toUpperCase() + seg.slice(1);
    crumbs.push({ label, href: isLast ? undefined : accumulated });
  });

  return crumbs;
}
