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
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <MailPlus className="size-4 text-muted-foreground" />
          Invite member
        </CardTitle>
        <CardDescription>
          Send an invitation email with the role the member should receive.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
        <InviteMembersForm projectId={projectId} />
      </CardContent>
    </Card>
  );
}
