import { ResetPasswordForm } from "../components/ResetPasswordForm";

export default function ResetPasswordPage() {
  return (
    <>
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Set new password
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Choose a strong password for your account
        </p>
      </div>

      <ResetPasswordForm />
    </>
  );
}
