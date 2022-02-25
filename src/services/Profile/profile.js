import express, {Router} from "express";
import ProfileModel from './profile-model.js'
import q2m from "query-to-mongo"
import {v2 as cloudinary} from 'cloudinary'
import {CloudinaryStorage} from 'multer-storage-cloudinary'
import multer from "multer";
import { pipeline } from "stream";
import json2csv, {Transform} from 'json2csv'
import { getPDFReadableStream } from "../file/pdfMaker.js";



const profilesRouter = Router()


const cloudinaryUploader = multer({
    storage: new CloudinaryStorage({
    cloudinary,
      params:{
        folder:'linkedin'
      }
    })
  }).single("image")





/************************* (post) create a profile ************************/
profilesRouter.post("/", async(req, res, next) => {
    try {
        console.log(req.body)
        const newProfile = new ProfileModel({...req.body, image:"https://www.unfe.org/wp-content/uploads/2019/04/SM-placeholder.png"})
        const {_id} = await newProfile.save()
        res.status(201).send({_id : _id})        
    } catch (error) {
        next(error)
    }
})

/************************* (put) edit a profile ************************/
profilesRouter.post("/:profileId/picture", cloudinaryUploader, async(req, res, next) => {
    try {
        const updatedProfile = await ProfileModel.findByIdAndUpdate(req.params.profileId, 
            {image:req.file.path},
            {new : true})
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

profilesRouter.get("/:profileId/downloadPdf",async(req,res,next)=>{

    const profileId = req.params.profileId
    try {
        const profile = await ProfileModel.findById(profileId)
        if(!profile){
            res.sendStatus(404).send({ message: `profile with ${req.params.profileId} is not found!` })
        } else {
            const pdfStream = await getPDFReadableStream(profile);
            res.setHeader("Content-Type", "application/pdf");
            pdfStream.pipe(res);
            pdfStream.end();
        }
            res.setHeader("Content-Disposition",`attachment; filename = resume${profileId}.pdf`)
            const source = getPDFReadableStream(profile)
            const destination = res;
            pipeline(source,destination, err => {
                if(err) next(err)
            })
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



/************************* (get) get a specific profile ************************/
profilesRouter.get("/me",  async(req, res, next) => {
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
            const newExprience = {...req.body,image:"https://www.unfe.org/wp-content/uploads/2019/04/SM-placeholder.png"}
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

/************************* (csv) create a csv file of experiences ************************/
profilesRouter.get("/:profileId/experiences/csv", async(req, res, next) => {
    try {  
        const profile = await ProfileModel.findById(req.params.profileId)
        const experiences = JSON.parse(JSON.stringify(profile.experiences))
        const csvFields = [
        "id",
        "role",
        "company",
        "startDate",
        "endDate",
        "description",
        "area",
        "username",
        "createdAt",
        "updatedAt",]
       
        const json2csvParser = json2csv.Parser
        const json2csvP = new json2csvParser({csvFields})
        const csvData = json2csvP.parse(experiences)
        res.setHeader("Content-disposition", `attachment; filename=exp${req.params.profileId}.csv`)
        res.set("Content-type", "text/csv")
        res.status(200).end(csvData)

        pipeline(readablestream, csvData, res, err => {
            if (err) next(err)
          }) 
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
                res.status(404).send(`Experience with id ${req.params.experienceId} not found`)        
            }
        }else{
            res.status(404).send(`Profile with id ${req.params.profileId} not found`)        
        }
    } catch (error) {
        next(error)
    }
})



/************************* (post) upload an image for specific experience ************************/
profilesRouter.post("/:profileId/experiences/:experienceId/picture", cloudinaryUploader, async(req, res, next) => {
    try {
        const reqProfile = await ProfileModel.findByIdAndUpdate(req.params.profileId)
        if(reqProfile){
            const index = reqProfile.experiences.findIndex(exp => exp._id.toString() === req.params.experienceId)
            if(index !== -1){
                reqProfile.experiences[index] = {
                    ...reqProfile.experiences[index].toObject(),
                    image: req.file.path
                }
                await reqProfile.save();
                res.send(reqProfile)
            } else {
                next(createError(404, `could not find the specific experience with id ${req.params.experienceId}`))
            }
        } else {
            next(createError(404, `could not find the specific profile with id ${req.params.profileId}`))

        }

    } catch (error) {
        next(error)
    }
})
/************************* (put) edit a profile's specific experience ************************/
profilesRouter.put("/:profileId/experiences/:experienceId", async(req, res, next) => {
    try {
        const reqProfile = await ProfileModel.findByIdAndUpdate(req.params.profileId)
        if(reqProfile){
            const index = reqProfile.experiences.findIndex(exp => exp._id.toString() === req.params.experienceId)
            if(index !== -1){
                reqProfile.experiences[index] = {
                    ...reqProfile.experiences[index].toObject(),
                    ...req.body
                }
                await reqProfile.save();
                res.send(reqProfile)
            } else {
                next(createError(404, `could not find the specific experience with id ${req.params.experienceId}`))
            }
        } else {
            next(createError(404, `could not find the specific profile with id ${req.params.profileId}`))

        }

    } catch (error) {
        next(error)
    }
})

/************************* (delete) delete a specific experience of a profile's ************************/

profilesRouter.delete("/:profileId/experiences/:experienceId", async(req, res, next) => {
    try {
        const modifiedProfile = await ProfileModel.findByIdAndUpdate(
            req.params.profileId,
            {$pull:{experiences : {_id : req.params.experienceId}}},
            {new : true}
        )
        if(modifiedProfile){
                res.send()
        } else {
            next(createError(404, `could not find the specific profile with id ${req.params.profileId}`))

        }

    } catch (error) {
        next(error)
    }
})



export default profilesRouter