import express from "express"
import listEndpoints from "express-list-endpoints"
import cors from "cors"
import mongoose from "mongoose"
import profilesRouter from "./services/Profile/profile.js"

const server = express()
const port = process.env.PORT || 3001

// ************************************* MIDDLEWARES ***************************************.

server.use(cors())
server.use(express.json())

// ************************************* ROUTES ********************************************

server.use("/profiles", profilesRouter)
// ************************************** ERROR HANDLERS ***********************************

mongoose.connect(process.env.MONGO_CONNECTION)

mongoose.connection.on("connected", () => {
  console.log("Successfully connected to Mongo!")
  server.listen(port, () => {
    console.table(listEndpoints(server))
    console.log("Server runnning on port: ", port)
  })
})
