import AsideRegister from "../components/register/AsideRegister";
import AuthNavigator from "../components/AuthNavigator";
import CardAuth from "../components/CardAuth";
import { RegisterForm } from "../components/register/RegisterForm";

export default function RegisterPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_18%_18%,--theme(--color-primary-500/0.22),transparent_30%),radial-gradient(circle_at_78%_12%,--theme(--color-primary-300/0.12),transparent_26%)]" />

      <div className="grid min-h-screen lg:grid-cols-[390px_1fr]">
        <AsideRegister />

        <section className="relative flex h-full items-center justify-center px-6 py-8 max-w-xl w-full m-auto">
          <CardAuth
            className=" w-full"
            title="Create your account"
            subtitle="Start crafting AI-powered projects today"
            Navigator={
              <AuthNavigator
                linkTo="/login"
                linkText="Log in"
                text="Already have an account?"
              />
            }
          >
            <RegisterForm />
          </CardAuth>
        </section>
      </div>
    </main>
  );
}
