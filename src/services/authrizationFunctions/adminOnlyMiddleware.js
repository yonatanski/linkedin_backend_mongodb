import createError from "http-errors"

export const adminOnlyMiddleware = (req, res, next) => {
  // if adminOnlyMiddleware is used AFTER basicAuthMiddleware, here we gonna have the possibility to access to req.user --> we can check the role of the user
  console.log("who ia am", req.user.role)
  if (req.user.role) {
    next()
  } else {
    next(createError(403, "Admin only endpoint!"))
  }
}
