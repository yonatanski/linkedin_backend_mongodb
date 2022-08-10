import express from "express"
import createHttpError from "http-errors"
import q2m from "query-to-mongo"
import multer from "multer" // it is middleware
import { v2 as cloudinary } from "cloudinary"
import { CloudinaryStorage } from "multer-storage-cloudinary"
import { validationResult } from "express-validator"
import { newBookValidation } from "./validation.js"
import PostsModel from "./schema.js"
import ProfileModel from "../Profile/profile-model.js"
import CommentModel from "../Comment/comment-model.js"
import { JWTAuthMiddleware } from "../authrizationFunctions/token.js"
const postRouter = express.Router()

const cloudinaryUploaderImageUrl = multer({
  storage: new CloudinaryStorage({
    cloudinary, // search automatically for process.env.CLOUDINARY_URL
    params: {
      folder: "linkedin",
    },
  }),
}).single("image")

// ************************************* ROUTERS *************************************

// -----------------------------------POST--------------------------------------
postRouter.post("/", JWTAuthMiddleware, async (req, res, next) => {
  // let defPost = {
  //   text: "This is default text from post BE -->> mongo db is easier to understand than postgres",
  //   image: "https://media.istockphoto.com/photos/yellow-vintage-tram-on-the-street-in-lisbon-portugal-picture-id1221460597?s=612x612",
  //   user: "6214fc2844fe9da6dc2d643f",
  // }
  try {
    const errorsList = validationResult(req)
    if (errorsList.isEmpty()) {
      console.log(req.body)
      const newPost = new PostsModel({ ...req.body, user: req.user._id })
      const { _id } = await newPost.save()
      res.status(201).send({ _id })
    } else {
      next(createHttpError(400, "Some errors occured in request body!", { errorsList }))
    }
  } catch (error) {
    next(error)
  }
})
// -----------------------------------GET--------------------------------------
postRouter.get("/", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const mongoQuery = q2m(req.query)
    const { total, post } = await PostsModel.findPostWithProfile(mongoQuery)
    if (true) {
      res.send({ total: total, post: post })
    } else {
      next(createHttpError(404, `REQUEST NOT FOUND !!`))
    }
  } catch (error) {
    next(error)
  }
})
postRouter.get("/search", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const query = req.query.query
    const searchResult = await PostsModel.find({ name: query }).populate({
      path: "user",
      select: "name surname image bio",
    })
    if (searchResult) {
      res.send(searchResult)
    } else {
      next(createHttpError(404, `REQUEST NOT FOUND !!`))
    }
  } catch (error) {
    next(error)
  }
})
// -----------------------------------GET WITH ID--------------------------------------

postRouter.get("/:postId", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const postId = req.params.postId
    const getPosts = await PostsModel.findById(postId)
      .populate({
        path: "user",
        select: "name surname image bio",
      })
      .populate({ path: "comments" })
    if (getPosts) {
      res.send(getPosts)
    } else {
      next(createHttpError(404, `POST  WITH ID:- ${postId} NOTFOUND !!`))
    }
  } catch (error) {
    next(error)
  }
})
// -----------------------------------PUT--------------------------------------
postRouter.put("/:postId", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const postId = req.params.postId
    const updatedPost = await PostsModel.findByIdAndUpdate(postId, req.body, {
      new: true,
    })
    if (updatedPost) {
      res.send(updatedPost)
    } else {
      next(createHttpError(404, `POST  WITH ID:- ${postId} CANNOT UPDATED  !!`))
    }
  } catch (error) {
    next(error)
  }
})
// -----------------------------------DELETE--------------------------------------

postRouter.delete("/:postId", async (req, res, next) => {
  try {
    const postId = req.params.postId
    const deletedPost = await PostsModel.findByIdAndDelete(postId)
    if (deletedPost) {
      res.status(204).send(deletedPost)
    } else {
      next(createHttpError(404, `POST  WITH ID:- ${postId} NOT FOUND  !!`))
    }
  } catch (error) {
    next(error)
  }
})
// ******************************************* ROUTE FOR IMAGE UPLOAD *******************************************

postRouter.post("/:id/uploadPostImg", cloudinaryUploaderImageUrl, async (req, res, next) => {
  try {
    const postId = req.params.id
    const updateProduct = await PostsModel.findByIdAndUpdate(
      postId,
      { image: req.file.path },
      {
        new: true,
      }
    )
    if (updateProduct) {
      res.send(updateProduct)
    } else {
      next(createHttpError(404, `Product with id${req.params.productId} found!`))
    }
  } catch (error) {
    console.log(error)
    next(error)
  }
})

// ******************************************* ROUTE FOR COMMENTS *******************************************

// -----------------------------------POST COMMENT--------------------------------------
postRouter.post("/:postId/comments", async (req, res, next) => {
  try {
    const postId = req.params.postId
    // const reqPost = await CommentModel.findById(postId)
    const newComment = new CommentModel({ ...req.body, post: postId })
    const { _id } = await newComment.save()
    res.status(201).send({ _id })
  } catch (error) {
    next(error)
  }
})

// -----------------------------------GET ALL COMMENT--------------------------------------
postRouter.get("/:postId/comments", async (req, res, next) => {
  try {
    const postId = req.params.postId
    const reqPost = await CommentModel.find({ post: postId }).populate({
      path: "user",
      select: "name surname bio image",
    })
    if (reqPost) {
      res.send(reqPost)
    } else {
      next(createHttpError(404, `POST  WITH ID:- ${postId} CANNOT UPDATED  !!`))
    }
  } catch (error) {
    next(error)
  }
})

// -----------------------------------GET 1 COMMENT--------------------------------------
postRouter.get("/:postId/comments/:commentId", async (req, res, next) => {
  try {
    const postId = req.params.postId
    const reqComment = await CommentModel.findOne({ _id: req.params.commentId })
    if (reqComment) {
      res.send(reqComment)
    } else {
      next(createHttpError(404, `POST  WITH ID:- ${postId} CANNOT UPDATED  !!`))
    }
  } catch (error) {
    next(error)
  }
})

// -----------------------------------EDIT COMMENT--------------------------------------
postRouter.put("/:postId/comments/:commentId", async (req, res, next) => {
  try {
    const upDatedComment = await CommentModel.findByIdAndUpdate(req.params.commentId, req.body, { new: true })
    if (upDatedComment) {
      res.send(upDatedComment)
    } else {
      next(createHttpError(404, `COMMENt  WITH ID:- ${req.params.commentId} CANNOT UPDATED  !!`))
    }
  } catch (error) {
    next(error)
  }
})

// -----------------------------------DELETE COMMENT--------------------------------------
postRouter.delete("/:postId/comments/:commentId", async (req, res, next) => {
  try {
    const reqComment = await CommentModel.findById(req.params.commentId)
    if (reqComment) {
      await CommentModel.findByIdAndDelete(req.params.commentId)
      res.send()
    } else {
      next(createHttpError(404, `POST  WITH ID:- ${postId} CANNOT UPDATED  !!`))
    }
  } catch (error) {
    next(error)
  }
})

// ******************************************* ROUTE FOR likes *******************************************

// ----------------------------------- LIKE DISLIKE--------------------------------------
postRouter.post("/:postId/likes", async (req, res, next) => {
  try {
    const postId = req.params.postId
    const reqPost = await PostsModel.findById(postId)
    if (reqPost) {
      const isAlreadyLiked = reqPost.likes.find((id) => id.toString() === req.body.user)
      if (!isAlreadyLiked) {
        const updatedPost = await PostsModel.findByIdAndUpdate(postId, { $push: { likes: req.body.user } }, { new: true })
        res.status(201).send(updatedPost)
      } else {
        const updatedPost = await PostsModel.findByIdAndUpdate(postId, { $pull: { likes: req.body.user } }, { new: true })
        res.status(201).send(updatedPost)
      }
    } else {
      next(createHttpError(404, `POST  WITH ID:- ${postId} CANNOT UPDATED  !!`))
    }
  } catch (error) {
    next(error)
  }
})

// -----------------------------------GET--------------------------------------
postRouter.get("/:postId/likes", async (req, res, next) => {
  try {
    const postId = req.params.postId
    const reqPost = await PostsModel.findById(postId)
    if (reqPost) {
      res.send(reqPost.likes)
    } else {
      next(createHttpError(404, `POST  WITH ID:- ${postId} CANNOT UPDATED  !!`))
    }
  } catch (error) {
    next(error)
  }
})

export default postRouter
