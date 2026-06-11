import { LoginForm } from "../components/LoginForm";

export default function LoginPage() {
  return (
    <>
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Welcome back
        </h1>
        <p className="mt-1.5 text-sm text-slate-500">
          Sign in to your Nexus-Flow account
        </p>
      </div>

      <LoginForm />
    </>
  );
}
