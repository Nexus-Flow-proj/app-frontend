import { useState, useRef } from "react";
import { AtSign, Camera, FileText, Layers, Loader2, Pencil, ScanSearch, Wrench } from "lucide-react";
import { ProfileEditSheet } from "./ProfileEditSheet";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { AVATAR_LIMITS } from "../constants";
import { useUploadAvatar } from "../hooks";
import type { PublicUserProfile, UserProfile } from "../types";
import { toast } from "sonner";

/** Accepts both the full owned profile and the read-only public profile. */
type ProfileData = UserProfile | PublicUserProfile;

interface ProfileAvatarCardProps {
  profile: ProfileData;
  /** When true the avatar is view-only — no Change Photo option. */
  readonly?: boolean;
}

export function ProfileAvatarCard({ profile, readonly = false }: ProfileAvatarCardProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const { mutate: uploadAvatar, isPending } = useUploadAvatar();

  const fullName = `${profile.firstName} ${profile.lastName}`.trim();
  const initials =
    `${profile.firstName.charAt(0) ?? ""}${profile.lastName.charAt(0) ?? ""}`.toUpperCase();

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";

    if (
      !AVATAR_LIMITS.acceptedTypes.includes(
        file.type as (typeof AVATAR_LIMITS.acceptedTypes)[number],
      )
    ) {
      toast.error("Please upload a JPEG, PNG, or WebP image.");
      return;
    }

    if (file.size > AVATAR_LIMITS.maxFileSize) {
      toast.error("Avatar must be smaller than 5 MB.");
      return;
    }

    uploadAvatar(file);
  }

  const avatarButton = (
    <button
      type="button"
      className="group relative flex size-[110px] shrink-0 overflow-hidden rounded-full border-4 border-card bg-card shadow-lg transition-all duration-300 hover:shadow-primary/20 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 cursor-pointer"
      title={readonly ? "View photo" : "Avatar options"}
      disabled={!readonly && isPending}
    >
      <Avatar className={`size-full transition-all duration-300 ${isPending ? "blur-[2px] scale-105" : "group-hover:scale-105 group-hover:blur-[1.5px]"}`}>
        <AvatarImage src={profile.avatarUrl ?? undefined} alt={fullName} />
        <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-primary/15 to-primary/30 text-primary">
          {initials}
        </AvatarFallback>
      </Avatar>

      {/* Upload spinner overlay — always shown while uploading */}
      {isPending ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/55 rounded-full backdrop-blur-[1px]">
          <Loader2 className="size-7 text-white animate-spin" />
          <span className="mt-1 text-[9px] font-bold tracking-widest text-white/90 uppercase">Uploading</span>
        </div>
      ) : (
        /* Hover overlay */
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/45 opacity-0 backdrop-blur-[1.5px] transition-all duration-300 group-hover:opacity-100 rounded-full">
          {readonly ? (
            <>
              <ScanSearch className="size-5 text-white" />
              <span className="mt-0.5 text-[9px] font-bold tracking-widest text-white uppercase">View</span>
            </>
          ) : (
            <>
              <Camera className="size-5 text-white" />
              <span className="mt-0.5 text-[9px] font-bold tracking-widest text-white uppercase">Options</span>
            </>
          )}
        </div>
      )}
    </button>
  );

  return (
    <>
      <Card className="overflow-hidden border border-border bg-card shadow-sm rounded-2xl pt-0">
        {/* Gradient Banner */}
        <div className="relative h-20 bg-gradient-to-b from-primary/40 via-violet-500/20 to-transparent dark:from-primary/40 dark:via-violet-600/25 dark:to-transparent" />

        <CardContent className="px-6 pb-6">
          {/* Centered Avatar + Name */}
          <div className="relative -mt-14 mb-5 flex flex-col items-center gap-2 text-center">

            {/* Avatar — dropdown when editable, plain click when readonly */}
            {readonly ? (
              <button
                type="button"
                onClick={() => setIsPreviewOpen(true)}
                className="group relative flex size-[110px] shrink-0 overflow-hidden rounded-full border-4 border-card bg-card shadow-lg transition-all duration-300 hover:shadow-primary/20 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 cursor-pointer"
                title="View photo"
              >
                <Avatar className="size-full transition-all duration-300 group-hover:scale-105 group-hover:blur-[1.5px]">
                  <AvatarImage src={profile.avatarUrl ?? undefined} alt={fullName} />
                  <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-primary/15 to-primary/30 text-primary">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/45 opacity-0 backdrop-blur-[1.5px] transition-all duration-300 group-hover:opacity-100 rounded-full">
                  <ScanSearch className="size-5 text-white" />
                  <span className="mt-0.5 text-[9px] font-bold tracking-widest text-white uppercase">View</span>
                </div>
              </button>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  {avatarButton}
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center" className="w-44">
                  <DropdownMenuItem
                    className="gap-2 cursor-pointer"
                    onSelect={() => setIsPreviewOpen(true)}
                  >
                    <ScanSearch className="size-3.5 text-muted-foreground" />
                    View Photo
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="gap-2 cursor-pointer"
                    onSelect={() => fileInputRef.current?.click()}
                    disabled={isPending}
                  >
                    <Camera className="size-3.5 text-muted-foreground" />
                    {isPending ? "Uploading…" : "Change Photo"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Name + Title */}
            <div className="space-y-1">
              <h2 className="text-xl font-bold tracking-tight text-foreground leading-tight">
                {fullName}
              </h2>
              {profile.title ? (
                <Badge
                  variant="secondary"
                  className="px-2.5 py-0.5 text-xs font-semibold bg-primary/10 text-primary border-none"
                >
                  {profile.title}
                </Badge>
              ) : (
                <span className="text-xs text-muted-foreground/60 italic">No title set</span>
              )}
            </div>

            {/* Edit Profile button — only for own profile */}
            {!readonly && (
              <button
                type="button"
                onClick={() => setIsEditOpen(true)}
                className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-xs font-semibold text-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1"
              >
                <Pencil className="size-3" />
                Edit Profile
              </button>
            )}
          </div>

          {/* Edit sheet — only mounted for own profile */}
          {!readonly && (
            <ProfileEditSheet
              profile={profile as import('../types').UserProfile}
              open={isEditOpen}
              onOpenChange={setIsEditOpen}
            />
          )}

          <Separator className="mb-5" />

          {/* Info grid */}
          <div className="space-y-4">
            {/* Email */}
            <div className="flex gap-3">
              <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md bg-primary/10">
                <AtSign className="size-3.5 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-semibold tracking-wider text-muted-foreground mb-0.5">
                  Email
                </p>
                <p className="text-sm font-medium text-foreground truncate">
                  {profile.email}
                </p>
              </div>
            </div>

            {/* Bio */}
            <div className="flex gap-3">
              <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md bg-primary/10">
                <FileText className="size-3.5 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-0.5">
                  Bio
                </p>
                {profile.bio ? (
                  <p className="text-sm leading-relaxed text-foreground/80 italic">
                    &ldquo;{profile.bio}&rdquo;
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground/60 italic">No bio added yet.</p>
                )}
              </div>
            </div>

            {/* Member Since */}
            <div className="flex gap-3">
              <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md bg-primary/10">
                <Layers className="size-3.5 text-primary" />
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-0.5">
                  Member since
                </p>
                <p className="text-sm font-medium text-foreground">
                  {new Date(profile.createdAt).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>

            <Separator />

            {/* Skills */}
            <div className="flex gap-3">
              <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md bg-primary/10">
                <Wrench className="size-3.5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  Skills &amp; Expertise
                </p>
                {profile.skills && profile.skills.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {profile.skills.map((skill, index) => (
                      <Badge
                        key={`${skill}-${index}`}
                        variant="secondary"
                        className="px-2.5 py-0.5 text-[11px] font-medium border-none bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground/60 italic">
                    {readonly
                      ? "No skills listed yet."
                      : "No skills added yet. Add your skills in the personal details form below."}
                  </p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Picture View Modal */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-md p-4 text-center">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">
              {fullName}
            </DialogTitle>
          </DialogHeader>
          <div className="mt-2 flex items-center justify-center overflow-hidden rounded-lg bg-muted/30 p-2">
            {profile.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt={fullName}
                className="max-h-[70vh] w-auto max-w-full rounded-md object-contain shadow-md"
              />
            ) : (
              <Avatar className="size-40 text-4xl">
                <AvatarFallback className="text-4xl font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Hidden file input — only rendered when editable */}
      {!readonly && (
        <input
          ref={fileInputRef}
          type="file"
          accept={AVATAR_LIMITS.acceptedTypes.join(",")}
          className="hidden"
          onChange={handleFileChange}
          aria-hidden="true"
        />
      )}
    </>
  );
}
