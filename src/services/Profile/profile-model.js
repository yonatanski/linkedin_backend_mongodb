import mongoose from "mongoose";

const { Schema, model } = mongoose;

// const connectionSchema = new Schema({
//     profileId : { type: Schema.Types.ObjectId, ref: "Profile" },

// })

const profileSchema = new Schema(
  {
    name: { type: String, required: true },
    surname: { type: String, required: true },
    email: { type: String, required: true },
    bio: { type: String, required: true },
    title: { type: String, required: true },
    area: { type: String, required: true },
    image: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    token:{ type: String, required: true,unique : true},
    // "connection":[connectionSchema],

    experiences: [
      {
        role: { type: String, required: true },
        company: { type: String, required: true },
        startDate: { type: Date, required: true },
        endDate: { type: Date },
        description: { type: String, required: true },
        area: { type: String, required: true },
        username: { type: String, required: true },
        image: { type: String, required: true },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default model("Profile", profileSchema);
