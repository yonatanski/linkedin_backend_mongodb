import mongoose from "mongoose"

const { Schema, model } = mongoose

const postSchema = new Schema(
  {
    text: { type: String },
    // username: { type: String },
    image: { type: String },
    user: { type: Schema.Types.ObjectId, ref: "Profile" },
    likes: [{ type: Schema.Types.ObjectId, ref: "Profile" }],
    comments: { type: Schema.Types.ObjectId, ref: "Comment" },
  },
  {
    timestamps: true,
  }
)

postSchema.static("findPostWithProfile", async function (mongoQuery) {
  const total = await this.countDocuments(mongoQuery.criteria) // If I use a normal function (not an arrow) here, the "this" keyword will give me the possibility to access to BooksModel
  const post = await this.find(mongoQuery.criteria)
    .limit(mongoQuery.options.limit)
    .skip(mongoQuery.options.skip)
    .sort(mongoQuery.options.sort) // no matter in which order you call this options, Mongo will ALWAYS do SORT, SKIP, LIMIT in this order
    .populate({
      path: "user",
      select: "name image bio",
    })
    .populate({
      path: "likes",
      select: "name surname image bio",
    })
  return { total, post }
})

export default model("Post", postSchema)
