import { BridgeLogo } from "@/components/bridge";

function Logo() {
  return (
    <>
      <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
        <BridgeLogo size={15} className="w-24 h-auto text-black dark:text-white" />
      </div>
      <div className="grid flex-1 text-left text-sm leading-tight">
        <span className="truncate font-bold tracking-tight">Bridge</span>
      </div>
    </>
  );
}

export default Logo;
