import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="mx-auto grid w-full max-w-sm gap-4">
      {/* all buttons styles */}
      <Button>default</Button>
      <Button variant="outline">outline</Button>
      <Button variant="destructive">destructive</Button>
      <Button variant="ghost">ghost</Button>
      <Button variant="link">link</Button>
      <Button variant="secondary">secondary</Button>
      <Button variant="dashed">dashed</Button>
      <Button variant="transparent">transparent</Button>
      <Button variant="soft">soft</Button>
      <Button variant="surface">surface</Button>

      <Button size={"xs"}>xs</Button>
      <Button size={"sm"}>sm</Button>
      <Button size={"lg"}>lg</Button>
      <Button size={"icon"}>
        <Plus />
      </Button>
      <Button size={"icon-sm"}>
        <Plus />
      </Button>
      <Button size={"icon-xs"}>
        <Plus />
      </Button>
      <Button disabled className="w-40">
        Ahmed
        <Plus />
      </Button>

      <Button isLoading>Loading</Button>
      <Button variant="outline">Saving</Button>
      <Button variant="dashed">Creating column</Button>

      {/* all badge styles */}
      <div className="flex flex-wrap items-center gap-2 pt-4">
        <Badge>default</Badge>
        <Badge variant="secondary">secondary</Badge>
        <Badge variant="destructive">destructive</Badge>
        <Badge variant="outline">outline</Badge>
        <Badge variant="ghost">ghost</Badge>
        <Badge variant="link">link</Badge>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Badge size="xs">xs</Badge>
        <Badge size="sm">sm</Badge>
        <Badge size="lg">lg</Badge>
        <Badge shape="pill">pill</Badge>
        <Badge shape="rounded">rounded</Badge>
        <Badge shape="square">square</Badge>
        <Badge shape="circle">3</Badge>
        <Badge size="xs" shape="circle">
          1
        </Badge>
        <Badge size="lg" shape="circle">
          9
        </Badge>
      </div>
    </div>
  );
}
