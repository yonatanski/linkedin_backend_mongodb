import createError from "http-errors"
import { verifyJWTToken } from "./authntication-tools.js"

export const JWTAuthMiddleware = async (req, res, next) => {
  if (!req.headers.authorization) {
    next(createError(401, "Please provide bearer token in authorization header!"))
  } else {
    try {
      // 2. Extract token from Authorization header
      const token = req.headers.authorization.replace("Bearer ", "")

      // 3. Verify the token (verify expiration date and check signature integrity), if everything is fine we should get back the payload ({_id, role})
      const payload = await verifyJWTToken(token)
      console.log("payload00", payload)

      // 4. If token is ok --> next
      req.user = {
        _id: payload._id,
        role: payload.role,
      }
      next()
    } catch (error) {
      // 5. In case of errors thrown by the jsonwebtoken module --> 401
      console.log("eror?????", error)
      next(createError(401, "Token not valid!"))
    }
  }
}
