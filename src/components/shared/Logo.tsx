import { LayersIcon } from "lucide-react";

function Logo() {
  return (
    <>
      <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary-600 text-white shadow-sm shadow-primary-500/40">
        <LayersIcon className="size-4" />
      </div>
      <div className="grid flex-1 text-left text-sm leading-tight">
        <span className="truncate font-bold tracking-tight">
          Nexus<span className="text-primary-500">-Flow</span>
        </span>
      </div>
    </>
  );
}

export default Logo;
