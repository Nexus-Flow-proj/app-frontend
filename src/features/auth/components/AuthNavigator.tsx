import { Link } from "react-router";

interface AuthNavigatorProps {
  linkTo: string;
  linkText: string;
  text?: string;
}

function AuthNavigator({ linkTo, linkText, text }: AuthNavigatorProps) {
  return (
    <p className="text-center text-xs font-semibold text-muted-foreground">
      {text}
      <Link to={linkTo} className="text-primary underline underline-offset-2">
        {linkText}
      </Link>
    </p>
  );
}

export default AuthNavigator;
