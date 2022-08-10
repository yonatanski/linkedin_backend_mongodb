import mongoose from "mongoose"
import bcrypt from "bcrypt"
const { Schema, model } = mongoose

// const connectionSchema = new Schema({
//     profileId : { type: Schema.Types.ObjectId, ref: "Profile" },

// })

const profileSchema = new Schema(
  {
    name: { type: String, required: true },
    surname: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    bio: { type: String },
    title: { type: String },
    area: { type: String },
    image: { type: String, default: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQzI7YtwWFUJbdWenZz4tSgKpdLuRHESbE8ww&usqp=CAU" },
    password: { type: String },
    username: { type: String, unique: true },
    // token: { type: String, required: true, unique: true },
    // "connection":[connectionSchema],
    googleId: { type: String },

    experiences: [
      {
        role: { type: String, required: true },
        company: { type: String, required: true },
        startDate: { type: Date, required: true },
        endDate: { type: Date, required: true },
        description: { type: String, required: true },
        area: { type: String, required: true },

        image: { type: String },
      },
    ],
  },
  {
    timestamps: true,
  }
)

profileSchema.pre("save", async function (next) {
  // BEFORE saving the user in db, hash the password
  // I am NOT using arrow function here because of "this"
  const newUser = this // "this" represents the current user I'm trying to save in db
  const plainPw = newUser.password

  if (newUser.isModified("password")) {
    // only if the user is modifying the password field I am going to use some CPU cycles to hash that, otherwise they are just wasted
    const hash = await bcrypt.hash(plainPw, 11)
    newUser.password = hash
  }

  next()
})

profileSchema.methods.toJSON = function () {
  // this toJSON function will be called EVERY TIME express does a res.send(user/s)

  const userDocument = this
  const userObject = userDocument.toObject()

  delete userObject.password
  delete userObject.__v

  return userObject
}

profileSchema.statics.checkCredentials = async function (email, plainPW) {
  // Given email and pw this method should check in db if email exists and then compare plainPW with the hash that belongs to that user and then return a proper response

  // 1. Find the user by email
  const user = await this.findOne({ email }) // "this" here refers to UserModel

  if (user) {
    // 2. If the user is found --> compare plainPW with the hashed one

    const isMatch = await bcrypt.compare(plainPW, user.password)

    if (isMatch) {
      // 3. If they do match --> return a proper response (user himself)
      return user
    } else {
      // 4. If they don't --> return null
      return null
    }
  } else {
    // 5. If the email is not found --> return null as well
    return null
  }
}

export default model("Profile", profileSchema)
