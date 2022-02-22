import express from "express"
import listEndpoints from "express-list-endpoints"
import cors from "cors"
import mongoose from "mongoose"
import postRouter from "./services/Post/post.js"
import { badRequestHandler, unauthorizedHandler, notFoundHandler, genericErrorHandler } from "./errorHandlers.js"

const server = express()
const port = process.env.PORT || 3005

// ************************************* MIDDLEWARES ***************************************.

server.use(cors())
server.use(express.json())

// ************************************* ROUTES ********************************************
server.use("/posts", postRouter)

// ************************************** ERROR HANDLERS ***********************************
server.use(badRequestHandler)
server.use(unauthorizedHandler)
server.use(notFoundHandler)
server.use(genericErrorHandler)

mongoose.connect(process.env.MONGO_CONNECTION)

mongoose.connection.on("connected", () => {
  console.log("Successfully connected to Mongo!")
  server.listen(port, () => {
    console.table(listEndpoints(server))
    console.log("Server runnning on port: ", port)
  })
})
