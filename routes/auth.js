const express = require("express");
const router = express.Router();
const User = require("./models/User")
const auth = require("../middleware/auth")
const config = require("config")
const gravatar = require("gravatar")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const {check, validationResult} = require("express-validator")


//@route GET /auth
//desc Test route
//access public
router.get("/", auth, async (req, res)=>{
    try {
        const user = await User.findById(req.user.id).select("-password");
        res.json(user);
    } catch (error) {
        console.log(error.message);
        res.status(500).send("server error")
    }
})

//@route POST /auth
//desc Authenticate user and get token (login route)
//access public
router.post("/", [
    check("email", "Please enter a valid email").isEmail(),
    check("password", "Password should be 6 characters long").exists()
] ,async (req, res)=>{
    const errors = validationResult(req);
    while(!errors.isEmpty()){
        return res.status(400).json({ errors: errors.array() });
    }

    const {name, email, password} = req.body;
    try {
            //Check if user exists 
        let user = await User.findOne({email});

        if(!user){
            return res.status(400).json({errors:[{msg : "Invalid Credentials"}]})
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch){
            return res.status(400).json({errors: [{msg: "Invalid Credentials"}]})
        }
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