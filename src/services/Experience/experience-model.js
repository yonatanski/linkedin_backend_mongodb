import mongoose, {Schema, model} from "mongoose"

const experienceSchema = new Schema({
    "role":  {type:String, required:true},
    "company":  {type:String, required:true},
    "startDate": {type:Date, required: true},
    "endDate": {type:Date},
    "description":  {type:String, required:true},
    "area":  {type:String, required:true},
    "username":  {type:String, required:true},
    "image": {type:String, required:true}
},{
    timestamps : true
})