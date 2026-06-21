import AuthNavigator from "../components/AuthNavigator";
import CardAuth from "../components/CardAuth";
import { ForgotPasswordForm } from "../components/ForgotPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <CardAuth
      title="Reset your password"
      subtitle="We'll send a reset link to your email"
      Navigator={<AuthNavigator linkTo="/login" linkText="Back to sign in" />}
    >
      <ForgotPasswordForm />
    </CardAuth>
  );
}
