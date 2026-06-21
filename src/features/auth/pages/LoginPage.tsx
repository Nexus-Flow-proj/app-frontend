import CardAuth from "../components/CardAuth";
import { LoginForm } from "../components/LoginForm";
import AuthNavigator from "../components/AuthNavigator";

function LoginPage() {
  return (
    <>
      <CardAuth
        title="Welcome back"
        subtitle="Login with your Google account"
        Navigator={
          <AuthNavigator
            linkTo="/register"
            linkText="Sign up"
            text="Don't have an account?"
          />
        }
      >
        <LoginForm />
      </CardAuth>

      <p className="mx-auto mt-6 max-w-70 text-center text-xs font-medium leading-5 text-muted-foreground">
        By clicking continue, you agree to our{" "}
        <span className="underline underline-offset-2">Terms of Service</span>{" "}
        and <span className="underline underline-offset-2">Privacy Policy</span>
        .
      </p>
    </>
  );
}

export default LoginPage;
