import { body } from "express-validator"

const userRegistration = [
  body("name").exists().withMessage("name is required").isString().withMessage("name must be string"),
  body("surname").exists().withMessage("surname is required").isString().withMessage("surname must be string"),
  body("email")
    .exists()
    .isEmail()
    .withMessage("Email is required and must be a valid email")
    .custom((value, { req }) => {
      if (value.includes("hotmail.com")) {
        throw new Error("Email address is not valid")
      }
      return true
    })
    .withMessage("You cant use invalid provider."),

  body("password").exists().withMessage("Password Required").isLength({ min: 4 }).withMessage("Password Required").withMessage("Password should be Minmum 4 charachter"),
]
export default userRegistration
