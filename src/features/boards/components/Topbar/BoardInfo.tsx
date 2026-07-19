import { useProjectStore } from "@/store";

function BoardInfo() {
  const activeProject = useProjectStore((state) => state.activeProject);
  console.log(activeProject);

  return (
    <h1 className="text-sm font-semibold text-foreground">
      {activeProject?.name ?? "Project"} Board
    </h1>
  );
}

export default BoardInfo;
