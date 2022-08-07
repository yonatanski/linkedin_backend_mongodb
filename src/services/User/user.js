import mongoose from "mongoose"

const { model, Schema } = mongoose
const userSchema = new Schema(
  {
    email: { type: String },
    password: { type: String },
  },
  {
    timestamps: true,
  }
)

export default model("user", userSchema)
