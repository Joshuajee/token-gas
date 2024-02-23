import { strictObject, z } from "zod";

export const erc20Schema = z.object({
  token: z.string().min(3, "Please select a valid token"),
  receiver: z.string().startsWith("0x", "Invalid address entered"),
  amount: z.number().positive().gt(0, "Invalid amount entered "),
});
