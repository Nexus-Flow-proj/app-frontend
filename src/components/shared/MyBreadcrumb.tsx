import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import type { BreadcrumbSegment } from "@/features/dashboard/utils/buildBreadcrumbs";
import { Link } from "react-router";

interface MyBreadcrumbProps {
  breadcrumbs: BreadcrumbSegment[];
}

function MyBreadcrumb({ breadcrumbs }: MyBreadcrumbProps) {
  return (
    <Breadcrumb className="hidden sm:block">
      <BreadcrumbList>
        {breadcrumbs.map((crumb, idx) => {
          const isLast = idx === breadcrumbs.length - 1;
          return (
            <span key={idx} className="flex items-center gap-1.5">
              <BreadcrumbItem>
                {isLast || !crumb.href ? (
                  <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link to={crumb.href}>{crumb.label}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!isLast && <BreadcrumbSeparator />}
            </span>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

export default MyBreadcrumb;
