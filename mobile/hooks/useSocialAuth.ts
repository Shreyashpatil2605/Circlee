import { useSSO } from "@clerk/clerk-expo";
import { useState } from "react";
import { modalService } from "@/context/ModalContext";

export const useSocialAuth = () => {
  const [isLoading, setIsloading] = useState(false);
  const { startSSOFlow } = useSSO();

  const handleSocialAuth = async (strategy: "oauth_google" | "oauth_apple") => {
    setIsloading(true);
    try {
      const { createdSessionId, setActive } = await startSSOFlow({ strategy });
      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId });
      }
    } catch (err) {
      console.log("Error in social auth", err);
      const provider = strategy === "oauth_google" ? "Google" : "Apple";
      modalService.showToast(
        `Failed to sign in with ${provider}. Please try again.`,
        "error"
      );
    } finally {
      setIsloading(false);
    }
  };
  return { isLoading, handleSocialAuth };
};
