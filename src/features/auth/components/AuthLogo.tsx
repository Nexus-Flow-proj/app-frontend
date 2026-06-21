import { Layers } from "lucide-react";

function AuthLogo() {
  return (
    <div className="mb-8 flex items-center justify-center gap-2 font-bold">
      <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm shadow-primary/30">
        <Layers className="size-5 animate-pulse font-bold" />
      </div>
      <span>
        Nexus<span className="text-primary">-Flow</span>
      </span>
    </div>
  );
}

export default AuthLogo;
