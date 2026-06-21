import { QueryCtx, MutationCtx } from "./_generated/server";

export async function getAuthUserId(
  ctx: QueryCtx | MutationCtx,
): Promise<string> {
  const identity = await ctx.auth.getUserIdentity();

  console.log("CONVEX IDENTITY:", identity);

  if (!identity) {
    throw new Error("Not authenticated");
  }

  return identity.subject;
}