import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface CardAuthProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  Navigator?: React.ReactNode;
  className?: string;
}

function CardAuth({
  title,
  subtitle,
  children,
  Navigator,
  className,
}: CardAuthProps) {
  return (
    <Card className={`${className} py-8 gap-6`}>
      <CardHeader className="text-center">
        <CardTitle className="font-bold">{title}</CardTitle>
        <CardDescription>{subtitle}</CardDescription>
      </CardHeader>
      <CardContent className="px-5">{children}</CardContent>
      {Navigator && (
        <CardFooter className="justify-center">{Navigator}</CardFooter>
      )}
    </Card>
  );
}

export default CardAuth;
