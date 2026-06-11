import { RegisterForm } from "../components/RegisterForm";

export default function RegisterPage() {
  return (
    <>
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Create your account
        </h1>
        <p className="mt-1.5 text-sm text-slate-500">
          Start collaborating with your team today
        </p>
      </div>

      <RegisterForm />
    </>
  );
}
