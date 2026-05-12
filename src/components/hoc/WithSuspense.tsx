import { Suspense, type ComponentType } from "react";
import Loading from "../shared/loading/Loading";

interface WithSuspenseProps {
  Component: ComponentType;
}

function WithSuspense({ Component }: WithSuspenseProps) {
  return (
    <Suspense fallback={<Loading fullPage text="Please wait..." />}>
      <Component />
    </Suspense>
  );
}

export default WithSuspense;
