import { z } from "zod";
import type { loginSchema, registerSchema, refreshTokenSchema } from "./user-contract";

export type LoginDTO = z.infer<typeof loginSchema>
export type RegisterDTO = z.infer<typeof registerSchema>;
export type RefreshTokenDTO = z.infer<typeof refreshTokenSchema>;