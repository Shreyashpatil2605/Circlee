// scripts/postinstall.js
const { execSync } = require("child_process");

// 1. Skip in Vercel or CI deployment environments
// Vercel only deploys the backend server, so mobile React Native patches are unnecessary here.
if (process.env.VERCEL || process.env.NOW_BUILDER) {
  console.log("Vercel deployment environment detected. Skipping patch-package.");
  process.exit(0);
}

// 2. Run patch-package for local development and mobile builds
try {
  console.log("Applying mobile patches via patch-package...");
  execSync("npx --no-install patch-package", { stdio: "inherit" });
} catch (error) {
  console.warn("Notice: patch-package skipped or encountered non-fatal notice.");
  process.exit(0);
}
