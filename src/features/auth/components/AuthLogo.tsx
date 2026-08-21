import { BridgeLogo } from "@/components/bridge";

function AuthLogo() {
  return (
    <div className="mb-8 flex items-center justify-center gap-2 font-bold">
      <span className="text-primary text-4xl">Bridge</span>
      <BridgeLogo size={108} />
    </div>
  );
}

export default AuthLogo;
