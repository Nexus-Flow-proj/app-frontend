import { MailPlus } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { InviteMembersForm } from "../InviteMembersForm";

interface InviteMemberCardProps {
  projectId: string;
}

export function InviteMemberCard({ projectId }: InviteMemberCardProps) {
  return (
    <Card className="rounded-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MailPlus className="size-4 text-muted-foreground" />
          Invite member
        </CardTitle>
        <CardDescription>
          Send an invitation email with the role the member should receive.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <InviteMembersForm projectId={projectId} />
      </CardContent>
    </Card>
  );
}
