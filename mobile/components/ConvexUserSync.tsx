import { useEffect, useRef } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useCurrentUser } from "@/hooks/useCurrentUser";

export default function ConvexUserSync() {
  const { currentUser } = useCurrentUser();
  const syncUser = useMutation(api.users.syncUser);
  const syncedUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!currentUser) return;
    if (syncedUserIdRef.current === currentUser.clerkId) return;

    syncedUserIdRef.current = currentUser.clerkId;
    syncUser({
      clerkId: currentUser.clerkId,
      email: currentUser.email,
      firstName: currentUser.firstName,
      lastName: currentUser.lastName,
      username: currentUser.username,
      profilePicture: currentUser.profilePicture,
    });
  }, [currentUser, syncUser]);

  return null;
}