import CardAuth from "../components/CardAuth";
import { ResetPasswordForm } from "../components/ResetPasswordForm";

export default function ResetPasswordPage() {
  return (
    <CardAuth
      title="Set new password"
      subtitle="Choose a strong password for your account"
    >
      <ResetPasswordForm />
    </CardAuth>
  );
}
