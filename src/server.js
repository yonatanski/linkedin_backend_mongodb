import express from "express"
import listEndpoints from "express-list-endpoints"
import cors from "cors"
import mongoose from "mongoose"
import profilesRouter from "./services/Profile/profile.js"
import postRouter from "./services/Post/post.js"
import { badRequestHandler, unauthorizedHandler, notFoundHandler, genericErrorHandler } from "./errorHandlers.js"
import authRouter from "./services/Auth/Auth.js"

const server = express()
const port = process.env.PORT || 3001

// ************************************* MIDDLEWARES ***************************************.
const whiteListOrigins = [process.env.PROD_FE_URL, process.env.DEV_FE_URL, process.env.DEV_FE_URL2]
server.use(
  cors({
    origin: function (origin, next) {
      if (!origin || whiteListOrigins.indexOf(origin) !== -1) next(null, true)
      else next(new Error("cors error"))
    },
  })
)
server.use(express.json())

// ************************************* ROUTES ********************************************
server.use("/api/auth", authRouter)
server.use("/api/posts", postRouter)

server.use("/api/profiles", profilesRouter)
// ************************************** ERROR HANDLERS ***********************************
server.use(badRequestHandler)
server.use(unauthorizedHandler)
server.use(notFoundHandler)
server.use(genericErrorHandler)

const uri = process.env.MONGODB_URI
mongoose.connect(uri || process.env.MONGO_CONNECTION)

mongoose.connection.on("connected", () => {
  console.log("Successfully connected to Mongo!")
  server.listen(port, () => {
    console.table(listEndpoints(server))
    console.log("Server runnning on port: ", port)
  })
})
