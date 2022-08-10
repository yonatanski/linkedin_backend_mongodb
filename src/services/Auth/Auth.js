import express from "express"
import passport from "passport"
import { validationResult } from "express-validator"
import createHttpError from "http-errors"
import { authenticateUser } from "../authrizationFunctions/authntication-tools.js"
import profileModel from "../Profile/profile-model.js"
import User from "../User/user.js"
import userRegistration from "../Validation/userRegistration.js"

// import userLoginValidation from "../validation/userLogin.js"
// import userRegisterValidation from "../validation/userRegister.js"

const authRouter = express.Router()
// *********************************************** REGISTER ***********************************************
authRouter.post("/register", userRegistration, async (req, res, next) => {
  try {
    const errorsList = validationResult(req)

    if (errorsList.isEmpty()) {
      const newUser = new profileModel(req.body)
      const user = new User(req.body)
      await user.save()
      const savedUser = await newUser.save()
      console.log(savedUser)
      if (savedUser) {
        const accessToken = await authenticateUser(savedUser)
        res.send({ savedUser, accessToken })
      } else {
        next(createHttpError(401, "Credentials are not ok!"))
      }
    } else {
      next(createHttpError(400, "wrong body!!", { errorsList }))
    }
  } catch (error) {
    next(error)
    console.log(error)
  }
})
// *********************************************** LOGIN ***********************************************
authRouter.post("/login", async (req, res, next) => {
  try {
    const errorsList = validationResult(req)

    if (errorsList.isEmpty()) {
      const { email, password } = req.body
      const User = await profileModel.checkCredentials(email, password)
      if (User) {
        const accessToken = await authenticateUser(User)
        res.send({ User, accessToken })
      } else {
        next(createHttpError(401, "Credentials are not ok!"))
      }
    } else {
      next(createHttpError(400, "wrong body!!", { errorsList }))
    }
  } catch (error) {
    next(error)
  }
})

authRouter.get("/googleLogin", passport.authenticate("google", { scope: ["email", "profile"] }))
authRouter.get("/googleRedirect", passport.authenticate("google"), (req, res, next) => {
  try {
    // passport middleware will receive the response from Google, then we gonna execute the route handler
    console.log(req.user)
    // res.send({ token: req.user.token })

    res.redirect(`${process.env.DEV_FE_URL}/oauth/${req.user.accessToken}`)
    // res.send(req.user)
  } catch (error) {
    next(error)
  }
})
export default authRouter
// http://localhost:3001/api/auth/undefined/?accessToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2MmYyYjA1NmIzMmQ1NDZmNWMyMGU1NjIiLCJpYXQiOjE2NjAwNzIzMjcsImV4cCI6MTY2MDY3NzEyN30.4nkC6t_hVI0T_m7JEI4CgEc3SHbfN07kPu0Mmchlm5U
