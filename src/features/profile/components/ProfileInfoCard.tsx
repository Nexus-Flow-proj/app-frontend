import { User } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ProfileInfoForm } from "./ProfileInfoForm";
import type { UserProfile } from "../types";

interface ProfileInfoCardProps {
  profile: UserProfile;
}

export function ProfileInfoCard({ profile }: ProfileInfoCardProps) {
  return (
    <Card className="rounded-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="size-4 text-muted-foreground" />
          Personal details
        </CardTitle>
        <CardDescription>
          Update your name, bio, title, and public skills.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ProfileInfoForm profile={profile} />
      </CardContent>
    </Card>
  );
}
