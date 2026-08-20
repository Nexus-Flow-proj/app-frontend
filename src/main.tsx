import { createRoot } from "react-dom/client";
import "./index.css";
import Providers from "./providers/index.tsx";
import { RouterProvider } from "react-router";
import router from "@/router";

const root = document.getElementById("root");
if (!root) throw new Error("Root element not found");

createRoot(root).render(
  <Providers>
    <RouterProvider router={router} />
  </Providers>,
);
