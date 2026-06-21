import { Button } from "@/components/ui/button";
import { handleGoogleAuth } from "../utils/googleAuth";
import { Badge } from "@/components/ui/badge";

interface GoogleAuthBtnProps {
  isPending: boolean;
  text?: string;
}

function GoogleAuthBtn({ isPending, text }: GoogleAuthBtnProps) {
  return (
    <Button
      type="button"
      variant="secondary"
      size="lg"
      onClick={handleGoogleAuth}
      disabled={isPending}
      className="w-full font-bold"
    >
      <Badge
        variant="outline"
        shape={"circle"}
        size="xs"
        className="text-primary font-extrabold border-primary/50"
      >
        G
      </Badge>
      {text || "Google"}
    </Button>
  );
}

export default GoogleAuthBtn;
