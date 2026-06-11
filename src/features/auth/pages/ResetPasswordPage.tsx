import { ResetPasswordForm } from "../components/ResetPasswordForm";

export default function ResetPasswordPage() {
  return (
    <>
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Set new password
        </h1>
        <p className="mt-1.5 text-sm text-slate-500">
          Choose a strong password for your account
        </p>
      </div>

      <ResetPasswordForm />
    </>
  );
}
