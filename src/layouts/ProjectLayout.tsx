import { Outlet } from "react-router";

function ProjectLayout() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Outlet />
    </div>
  );
}

export default ProjectLayout;
