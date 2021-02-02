const express = require("express");
const router = express.Router();
const {check, validationResult} = require("express-validator")
const User = require("./models/User")
const gravatar = require("gravatar")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const config = require("config")

//@route    GET api/users
//desc      Register user
//access    public
router.post("/", [
    check("name", "name is required").not().isEmpty(), 
    check("email", "Please enter a valid email").isEmail(),
    check("password", "Password should be 6 characters long").isLength({min:6})
] ,async (req, res)=>{
    const errors = validationResult(req);
    while(!errors.isEmpty()){
        return res.status(400).json({ errors: errors.array() });
    }

    const {name, email, password} = req.body;
    try {
            //Check if user exists 
        let user = await User.findOne({email});
        if(user){
            return res.status(400).send({errors:[{msg : "User already exists"}]})
        }

        //Get user gravatar
        const avatar = gravatar.url(email, {
            s:"200", 
            r:"pg", 
            d:"mm"
        })
        
        user = new User({
            name, 
            email, 
            password, 
            avatar
        })
        //Excrypt password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        await user.save();


        //reuturn jsonwebtoken
        const payload = {
            user:{
                id: user.id
            }
        }

        jwt.sign(payload, config.get("jwtSecret"), {expiresIn: 36000}, (err, token)=>{if (err) throw err;
             res.json({token})});

    } catch (error) {
        console.log(error.message);
        res.status(500).send("Server Error")
    }
})  

module.exports = router 