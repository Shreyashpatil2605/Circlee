import { SignUp } from "@clerk/nextjs";

export const metadata = {
  title: "Create Account — Circlee",
  description: "Join Circlee and connect with your people.",
};

export default function SignUpPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-black">
      <div className="w-full max-w-md flex justify-center">
        <SignUp
          appearance={{
            elements: {
              rootBox: "w-full",
              card: "bg-[#0D0D12] border border-[#272733] shadow-2xl text-white",
              headerTitle: "text-white font-display text-2xl",
              headerSubtitle: "text-[#A5A0B2]",
              socialButtonsBlockButton: "border-[#272733] bg-[#14141C] text-white hover:bg-[#1A1A24]",
              formButtonPrimary: "bg-circlee-gradient hover:opacity-95 text-white font-semibold",
              formFieldInput: "bg-[#14141C] border-[#272733] text-white",
              formFieldLabel: "text-[#A5A0B2]",
              footerActionLink: "text-[#8B5CF6] hover:text-[#D946EF]",
            },
          }}
          routing="path"
          path="/signup"
          signInUrl="/login"
          forceRedirectUrl="/home"
        />
      </div>
    </div>
  );
}
