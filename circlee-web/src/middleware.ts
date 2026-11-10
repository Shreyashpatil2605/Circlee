import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Define public routes that do not require authentication
const isPublicRoute = createRouteMatcher([
  "/",
  "/features(.*)",
  "/about(.*)",
  "/download(.*)",
  "/contact(.*)",
  "/legal(.*)",
  "/login(.*)",
  "/signup(.*)",
]);

export default clerkMiddleware((auth, req) => {
  if (!isPublicRoute(req)) {
    auth().protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
