import { QueryCtx, MutationCtx } from "./_generated/server";

export async function getAuthUserId(
  ctx: QueryCtx | MutationCtx,
): Promise<string> {
  // Use identity from Clerk
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Not authenticated");
  }
  return identity.subject;
}
