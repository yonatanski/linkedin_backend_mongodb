import mongoose from "mongoose"

const {model, Schema} = mongoose
const commentsSchema = new Schema({
    user : { type: Schema.Types.ObjectId, ref: "Profile" },
    comment:  { type: String, required:true },
    post: {type:String}
}, {
  timestamps: true,
})

export default model("Comment", commentsSchema)