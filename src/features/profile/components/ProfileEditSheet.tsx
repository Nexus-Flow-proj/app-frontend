import { useState } from "react";
import { Pencil, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { ProfileInfoForm } from "./ProfileInfoForm";
import type { UserProfile } from "../types";

interface ProfileEditSheetProps {
  profile: UserProfile;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProfileEditSheet({ profile, open, onOpenChange }: ProfileEditSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md flex flex-col gap-0 p-0">
        {/* Header */}
        <SheetHeader className="px-6 pt-6 pb-4">
          <div className="flex items-center gap-2.5">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10">
              <User className="size-4 text-primary" />
            </span>
            <div>
              <SheetTitle className="text-base font-semibold">Edit Profile</SheetTitle>
              <SheetDescription className="text-xs">
                Update your name, title, bio, and skills.
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <Separator />

        {/* Scrollable form body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <ProfileInfoForm profile={profile} />
        </div>
      </SheetContent>
    </Sheet>
  );
}

/** Convenience trigger button — place anywhere near the profile header. */
export function ProfileEditButton({ onClick }: { onClick: () => void }) {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={onClick}
      className="gap-1.5 text-xs font-semibold"
    >
      <Pencil className="size-3.5" />
      Edit Profile
    </Button>
  );
}
