import { StringValue } from "ms";
import { env } from "@/env";

type AuthConfig = {
  jwt: {
    secret: string;
    expiresIn: StringValue;
  };
};

export const authConfig: AuthConfig = {
  jwt: {
    secret: env.JWT_SECRET,
    expiresIn: "1d",
  },
};
