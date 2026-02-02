import { aj } from "../config/arcjet";
export const arcjetMiddware = async (req, res, next) => {
  try {
    const decision = await aj.protect(req, {
      requsted: 1,
    });
    //handle denied request
    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        return res.status(429).json({
          error: "Too Many requests",
          message: "Rate limit exceeded, please try again",
        });
      } else if (decision.reason.isBot()) {
        return res.status(403).json({
          error: "Bot access denied",
          message: "Automated requests are not allowed",
        });
      } else {
        return res.status(403).json({
          error: "Forbidden",
          message: "Access denied by security policy",
        });
      }
    }
    //check for spoofed boot
    if (
      decision.result.some(
        (result) => result.reason.isBot() && result.reason.isSpoofed(),
      )
    ) {
      return res.status(403).json({
        error: "Spoofed bot detected",
        message: "Malicious bot activity detected",
      });
    }

    next();
  } catch (error) {
    console.error("Arcjet middleware error:", error);
    next();
  }
};
