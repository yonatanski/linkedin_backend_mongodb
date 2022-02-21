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

/************************* (get) getting all profiles ************************/
profilesRouter.get("/", async(req, res, next) => {
    try {
        const allProfiles = await ProfileModel.find()
        res.status(201).send(allProfiles)        
    } catch (error) {
        next(error)
    }
})

/************************* (get) get a specific profile ************************/
profilesRouter.get("/:profileId", async(req, res, next) => {
    try {
        const reqProfiles = await ProfileModel.findById(req.params.profileId)
        if(reqProfiles){
            res.status(201).send(reqProfiles)        
        }else{
            res.status(404).send(`Profile with id ${req.params.profileId} not found`)        
        }
    } catch (error) {
        next(error)
    }
})

/************************* (put) edit a profile ************************/
profilesRouter.put("/:profileId", async(req, res, next) => {
    try {
        const updatedProfile = await ProfileModel.findByIdAndUpdate(req.params.profileId, req.body,{new : true})
        if(updatedProfile){
            res.status(201).send(updatedProfile)        
        }else{
            res.status(404).send(`Profile with id ${req.params.profileId} not found`)        
        }
    } catch (error) {
        next(error)
    }
})

/************************* (put) edit a profile ************************/
profilesRouter.delete("/:profileId", async(req, res, next) => {
    try {
        const updatedProfile = await ProfileModel.findByIdAndDelete(req.params.profileId)
        if(updatedProfile){
            res.status(204).send()        
        }else{
            res.status(404).send(`Profile with id ${req.params.profileId} not found`)        
        }
    } catch (error) {
        next(error)
    }
})
export default profilesRouter