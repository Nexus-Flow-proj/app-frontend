import { LoginForm } from "../components/LoginForm";

export default function LoginPage() {
  return (
    <>
      <div className="mb-5 text-center">
        <h1 className="text-lg font-bold tracking-tight text-foreground">
          Welcome back
        </h1>
        <p className="mt-2 text-xs text-muted-foreground">
          Login with your Google account
        </p>
      </div>

      <LoginForm />
    </>
  );
}
