import express from "express"
import createHttpError from "http-errors"
import q2m from "query-to-mongo"
import PostsModel from "./schema.js"

const postRouter = express.Router()

// ************************************* ROUTERS *************************************

// -----------------------------------POST--------------------------------------
postRouter.post("/", async (req, res, next) => {
  try {
    console.log(req.body)
    const newPost = new PostsModel(req.body)
    const { _id } = await newPost.save()
    res.status(201).send({ _id })
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
    const getPosts = await PostsModel.findById(postId)
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
    const updated
  } catch (error) {
    next(error)
  }
})
// -----------------------------------DELETE--------------------------------------

postRouter.delete("/", async (req, res, next) => {
  try {
  } catch (error) {
    next(error)
  }
})

export default postRouter
