import { ForgotPasswordForm } from "../components/ForgotPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <>
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Reset your password
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          We&apos;ll send a reset link to your email
        </p>
      </div>

      <ForgotPasswordForm />
    </>
  );
}
