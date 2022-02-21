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

        res.status(201).send({
            links:mongoQuery.links("/profiles",total),
            total,
            totalPages: Math.ceil(total/mongoQuery.options.limit),
            profiles})        
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

/************************* (post) post a Experience to specific profile ************************/
profilesRouter.post("/:profileId/experiences", async(req, res, next) => {
    try {
        const reqProfile = await ProfileModel.findById(req.params.profileId)
        if(reqProfile){
            const newExprience = {...req.body}
            const updatedProfile = await ProfileModel.findByIdAndUpdate(
                req.params.profileId,
                {$push: {experiences : newExprience}},
                {new : true}
            ) 
            res.status(201).send(updatedProfile)        
        }else{
            res.status(404).send(`Profile with id ${req.params.profileId} not found`)        
        }
    } catch (error) {
        next(error)
    }
})

/************************* (get) get all experiences of a specific user ************************/
profilesRouter.get("/:profileId/experiences", async(req, res, next) => {
    try {
        const reqProfile = await ProfileModel.findById(req.params.profileId)
        if(reqProfile){
            res.status(201).send(reqProfile.experiences)        
        }else{
            res.status(404).send(`Profile with id ${req.params.profileId} not found`)        
        }
    } catch (error) {
        next(error)
    }
})

/************************* (get) get specific experience of a specific user ************************/
profilesRouter.get("/:profileId/experiences/:experienceId", async(req, res, next) => {
    try {
        const reqProfile = await ProfileModel.findById(req.params.profileId)
        if(reqProfile){
            const reqExperience = reqProfile.experiences.find(exp => exp._id.toString() === req.params.experienceId)
            if(reqExperience){
                res.status(201).send(reqExperience)        
            } else{
                res.status(404).send(`Experience with ${req.params.experienceId} not found`)        
            }
        }else{
            res.status(404).send(`Profile with id ${req.params.profileId} not found`)        
        }
    } catch (error) {
        next(error)
    }
})


export default profilesRouter