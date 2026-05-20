import { defineAuth } from "@convex-dev/auth/server";
import { password } from "@convex-dev/auth/providers/Password";

const MyAuth = defineAuth({
  providers: [password],
});

export default MyAuth;
