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

/************************* (post) create a profile ************************/
profilesRouter.get("/", async(req, res, next) => {
    try {
        const allProfiles = await ProfileModel.find()
        res.status(201).send(allProfiles)        
    } catch (error) {
        next(error)
    }
})

/************************* (post) create a profile ************************/
profilesRouter.get("/:id", async(req, res, next) => {
    try {
        const reqProfiles = await ProfileModel.findById(req.params.id)
        if(reqProfiles){
            res.status(201).send(reqProfiles)        
        }else{
            res.status(404).send(`Profile with id ${req.params.id} not found`)        
        }
    } catch (error) {
        next(error)
    }
})

export default profilesRouter