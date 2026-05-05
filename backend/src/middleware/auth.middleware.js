export const protectRoute = async (req, res, next) => {
  if (!req.auth().isAuthenticated) {
    return res
      .status(400)
      .json({ message: "Unauthorized - you must be locked in" });
  }
  next();
};
