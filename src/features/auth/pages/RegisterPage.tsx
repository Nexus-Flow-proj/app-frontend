import { RegisterForm } from "../components/RegisterForm";

export default function RegisterPage() {
  return (
    <>
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-black tracking-tight text-foreground">
          Create your account
        </h1>
        <p className="mt-3 text-xs font-medium text-muted-foreground">
          Start crafting AI-powered projects today
        </p>
      </div>

      <RegisterForm />
    </>
  );
}
