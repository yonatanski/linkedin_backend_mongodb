import express from "express"
import createHttpError from "http-errors"
import q2m from "query-to-mongo"
import multer from "multer" // it is middleware
import { v2 as cloudinary } from "cloudinary"
import { CloudinaryStorage } from "multer-storage-cloudinary"
import { validationResult } from "express-validator"
import { newBookValidation } from "./validation.js"
import PostsModel from "./schema.js"

const postRouter = express.Router()

const cloudinaryUploaderImageUrl = multer({
  storage: new CloudinaryStorage({
    cloudinary, // search automatically for process.env.CLOUDINARY_URL
    params: {
      folder: "Linkiden",
    },
  }),
}).single("PostImage")

// ************************************* ROUTERS *************************************

// -----------------------------------POST--------------------------------------
postRouter.post("/", newBookValidation, async (req, res, next) => {
  try {
    const errorsList = validationResult(req)
    if (errorsList.isEmpty()) {
      console.log(req.body)
      const newPost = new PostsModel(req.body)
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
postRouter.get("/", async (req, res, next) => {
  try {
    const getPosts = await PostsModel.find({})
    if (getPosts) {
      res.send(getPosts)
    } else {
      next(createHttpError(404, `REQUEST NOT FOUND !!`))
    }
  } catch (error) {
    next(error)
  }
})
// -----------------------------------GET WITH ID--------------------------------------
postRouter.get("/:postId", async (req, res, next) => {
  try {
    const postId = req.params.postId
    const getPosts = await PostsModel.findById(postId).populate({
      path: "users",
      select: "",
    })
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
postRouter.put("/:postId", async (req, res, next) => {
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

postRouter.post("/:postId/uploadPostImg", cloudinaryUploaderImageUrl, async (req, res, next) => {
  try {
    const postId = req.params.postId
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

export default postRouter
