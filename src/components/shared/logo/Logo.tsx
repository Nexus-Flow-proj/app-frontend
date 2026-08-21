import { BridgeLogo } from "@/components/bridge";
import { cn } from "@/lib/utils";

interface LogoProps {
  textClassName?: string;
  markClassName?: string;
}

function Logo({ textClassName, markClassName }: LogoProps) {
  return (
    <>
      {/* <div className="flex aspect-square size-8 items-center justify-center rounded-lg  text-primary-foreground shadow-sm"> */}
      {/* </div> */}
      <div
        className={cn(
          "grid text-left text-2xl leading-tight text-primary dark:text-white",
          textClassName,
        )}
      >
        <span className="truncate font-bold tracking-tight">Bridge</span>
      </div>
      <BridgeLogo
        size={72}
        className={cn("flex-1 text-black dark:text-white", markClassName)}
      />
    </>
  );
}

export default Logo;
