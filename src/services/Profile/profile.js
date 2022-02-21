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

          const defaultQuery = {
            sort : "=createdAt",
            skip:0,
            limit:20
        }

        const query = {...defaultQuery, ...req.query}
        const mongoQuery = q2m(query);
        const total = await ProfileModel.countDocuments(mongoQuery.criteria);

        const profiles  = await ProfileModel
        .find(mongoQuery.criteria)
        .sort(mongoQuery.options.sort)
        .skip(mongoQuery.options.skip)
        .limit(mongoQuery.options.limit)

        res.status(201).send(profiles)        
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