import express, {Router} from "express";
import ProfileModel from './profile-model.js'
import q2m from "query-to-mongo"

const profilesRouter = Router()

/************************* (post) create a profile ************************/
profilesRouter.post("/", async(req, res, next) => {
    try {
        const newProfile = new ProfileModel(req.body)
        const {_id} = await newProfile.save()
        res.status(201).send({_id : _id})        
    } catch (error) {
        next(error)
    }
})
export default profilesRouter