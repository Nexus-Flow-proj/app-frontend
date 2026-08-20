import { z } from "zod";

export const checkoutSchema = z.object({
  tier: z.enum(["PRO", "BUSINESS"]),
  interval: z.enum(["MONTHLY", "ANNUAL"]).default("MONTHLY"),
});

export type CheckoutSchema = z.infer<typeof checkoutSchema>;
