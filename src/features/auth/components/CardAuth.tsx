import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import AuthNavigator from "./AuthNavigator";

interface CardAuthProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

function CardAuth({ title, subtitle, children }: CardAuthProps) {
  return (
    <Card className="py-8 gap-6">
      <CardHeader className="text-center">
        <CardTitle className="font-bold">{title}</CardTitle>
        <CardDescription>{subtitle}</CardDescription>
      </CardHeader>
      <CardContent className="px-5">{children}</CardContent>
      <CardFooter className="justify-center">
        <AuthNavigator
          linkTo="/register"
          linkText="Sign up"
          text="Don't have an account?"
        />
      </CardFooter>
    </Card>
  );
}

export default CardAuth;
