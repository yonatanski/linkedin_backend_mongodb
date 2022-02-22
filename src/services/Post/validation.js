import { body } from "express-validator"

export const newBookValidation = [body("text").exists().withMessage("text is a mandatory field!"), body("username").exists().withMessage("username is a mandatory field!")]
