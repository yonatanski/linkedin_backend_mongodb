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
postRouter.post("/", async (req, res, next) => {
  let defPost  =      {
    "text": "This is default text from post BE -->> mongo db is easier to understand than postgres",
    "image":"https://media.istockphoto.com/photos/yellow-vintage-tram-on-the-street-in-lisbon-portugal-picture-id1221460597?s=612x612", 
    "user":"6214fc2844fe9da6dc2d643f"
}
  try {
    const errorsList = validationResult(req)
    if (errorsList.isEmpty()) {
      console.log(req.body)
      const newPost = new PostsModel({...defPost, ...req.body})
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
    const mongoQuery= q2m(req.query)
    const {total,post} = await PostsModel.findPostWithProfile(mongoQuery)
    if (true) {
      console.log("h")
      res.send({total:total, post:post})
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
      path: "user",
      select: "name surname image bio",
    }).populate({path:"comments"})
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



// ******************************************* ROUTE FOR COMMENTS *******************************************

// -----------------------------------PUT COMMENT--------------------------------------
postRouter.post("/:postId/comments", async (req, res, next) => {
  try {
    const postId = req.params.postId
    const reqPost = await PostsModel.findById(postId)
    if (reqPost) {
      const newComment = {...req.body}
      console.log(newComment)
      const updatedPost = await PostsModel.findByIdAndUpdate(
      postId, 
      {$push : {comments : newComment}},
       {new : true}
    )
      res.status(201).send(updatedPost)
    } else {
      next(createHttpError(404, `POST  WITH ID:- ${postId} CANNOT UPDATED  !!`))
    }
  } catch (error) {
    next(error)
  }
})

// -----------------------------------GET ALL COMMENT--------------------------------------
postRouter.get("/:postId/comments", async (req, res, next) => {
  try {
    const postId = req.params.postId
    const reqPost = await PostsModel.findById(postId)
    if (reqPost) {
      res.send(reqPost.comments)
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
    const reqPost = await PostsModel.findById(postId)
    if (reqPost) {
      const reqComment = reqPost.comments.find(comment => comment._id.toString() === req.params.commentId)
     if(reqComment){
      res.send(reqComment)
     } else {
       next(createHttpError(404, `comment  WITH ID:- ${req.params.commentId} NOT FOUND  !!`))
     }
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
    const postId = req.params.postId
    const reqPost = await PostsModel.findById(postId)
    if (reqPost) {
      const index =  reqPost.comments.findIndex(comment => comment._id.toString() === req.params.commentId)
      if(index !== -1){
         reqPost.comments[index] = {
           ...reqPost.comments[index].toObject(),
           ...req.body
         }
         await reqPost.save()
        res.send(reqPost.comments[index])
      } else{
        next(createHttpError(404, `COMMENt  WITH ID:- ${req.params.commentId} CANNOT UPDATED  !!`))
      }
    } else {
      next(createHttpError(404, `POST  WITH ID:- ${postId} CANNOT UPDATED  !!`))
    }
  } catch (error) {
    next(error)
  }
})

// -----------------------------------DELETE COMMENT--------------------------------------
postRouter.delete("/:postId/comments/:commentId", async (req, res, next) => {
  try {
    const postId = req.params.postId
    const reqPost = await PostsModel.findById(postId)
    if (reqPost) {
      const updatedPost =  await PostsModel.findByIdAndUpdate(
        postId,
        {$pull :{comments:{_id:req.params.commentId}}},
        {new : true}
      )
      res.send(updatedPost)
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
      const isAlreadyLiked = reqPost.likes.find(id => id.toString() === req.body.user)
      if(!isAlreadyLiked){
        const updatedPost = await PostsModel.findByIdAndUpdate(
        postId, 
        {$push : {likes : req.body.user}},
        {new : true}
      )
      res.status(201).send(updatedPost)
      } else{
        const updatedPost = await PostsModel.findByIdAndUpdate(
          postId, 
          {$pull : {likes : req.body.user}},
          {new : true}
        )
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
