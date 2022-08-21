import passport from "passport"
import GoogleStrategy from "passport-google-oauth20"
import ProfileModel from "../Profile/profile-model.js"
import { authenticateUser } from "./authntication-tools.js"

const googleStrategy = new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_ID,
    clientSecret: process.env.GOOGLE_SECRET,
    callbackURL: `${process.env.PROD_BE_URL}/api/auth/googleRedirect`,
  },
  async (accessToken, refreshToken, profile, passportNext) => {
    try {
      // this callback is executed when Google send us a successfull response back
      // here we are receiving some informations about the user from Google (scopes --> profile, email)
      console.log(profile)

      // 1. Check if the user is already in our db
      const user = await ProfileModel.findOne({ email: profile.emails[0].value })

      if (user) {
        // 2. If the user is there --> generate accessToken (optionally a refreshToken)
        const token = await authenticateUser(user)

        // 3. We go next (we go to the route handler)
        passportNext(null, { User: user, accessToken: token })
      } else {
        // 4. Else if the user is not in our db --> add the user to db and then create token(s) for him/her

        const newProfile = new ProfileModel({
          name: profile.name.givenName,
          surname: profile.name.familyName,
          image: profile.photos[0].value,
          email: profile.emails[0].value,
          googleId: profile.id,
        })

        const saveProfile = await newProfile.save()
        const token = await authenticateUser(saveProfile)

        // 5. We go next (we go to the route handler)
        passportNext(null, { User: saveProfile, accessToken: token })
      }
    } catch (error) {
      passportNext(error)
    }
  }
)

// if you get the "Failed to serialize user into session" error, you have to add the following code

passport.serializeUser((data, passportNext) => {
  passportNext(null, data)
})

export default googleStrategy
