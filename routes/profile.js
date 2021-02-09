const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth")
const User = require("./models/User");
const Profile = require("./models/Profile")
const {check, validator, validationResult} = require("express-validator")

//@route GET /profile/me
//desc Get current user profiles
//access private
router.get("/me",auth,  async (req, res)=>{
    try {
        const profile = await Profile.findOne({user: req.user.id}).populate("user", ["name", "avatar"]);

        if(!profile){
            return res.status(400).send("No profile found")
        }

        res.json(profile);
    } catch (error) {
        res.status(500).send(error.message);
    }
})

//@route Post /profile
//desc Create or update a profile
//access private
router.post("/", auth, [
    check("status", "status is required").not().isEmpty(),
    check("skills", "skills is required").not().isEmpty()
], async (req, res)=>{
const errors = validationResult(req);
    if(!errors.isEmpty){
       return res.status(400).json({ errors: errors.array()});
    }
    const {
        company, website, location, bio, status, githubusername, skills, youtube, facebook, twitter, instagram, linkedin
    } = req.body;

    const profileFields = {};
    profileFields.user = req.user.id;
    if(company) profileFields.company = company; 
    if(website) profileFields.website = website;
    if(location) profileFields.location = location; 
    if(bio) profileFields.bio = bio; 
    if(status) profileFields.status = status;
    if(githubusername) profileFields.githubusername = githubusername; 
    if(skills){
        profileFields.skills = skills.split(",").map(skill => skill.trim());
    }

    profileFields.social = {};
    if ( youtube ) profileFields.social.youtube = youtube;
    if ( twitter ) profileFields.social.twitter = twitter ;
    if ( facebook ) profileFields.social.facebook = facebook ;
    if ( instagram ) profileFields.social.instagram = instagram ;
    if ( linkedin ) profileFields.social.linkedin = linkedin;

    try{
        let profile = await Profile.findOne({user:req.user.id});
        console.log(req.user.id);
        if(profile){
            profile = await Profile.findOneAndUpdate({user: req.user.id}, {$set:profileFields}, {new:true});
            return res.json(profile);
        }

        profile = new Profile(profileFields);
        await profile.save();
        return res.json(profile);

    }catch(error){
        return res.status(500).send(error);
    }
})

//@route Get /profile
//desc get all profiles 
//access public
router.get("/", async (req, res)=>{
    try {
        const profiles = await Profile.find({}).populate("user", ["name", "avatar"] );
        res.json(profiles);
    } catch (error) {
        return res.status(500).send(error.message)
    }
})

//@route Get /profile/user/:user_id
//desc get specific profile by id 
//access public
router.get("/user/:user_id", async (req, res)=>{
    try {
        const profile = await Profile.find({user:req.params.user_id});
                if(!profile){
            return res.status(400).json({msg: "Profile not found"})
        }
        res.json(profile);
    } catch (error) {
        return res.status(500).send(error.message)
    }
})

//@route Delete /profile
//Delete a profile and a user and posts 
//access private
router.delete("/",auth ,async (req, res)=>{
    try {
        await Profile.findOneAndRemove({user:req.user.id});
        await User.findOneAndRemove({_id: req.user.id});

        res.json({message:"Profile Deleted"});
    } catch (error) {
        return res.status(500).send(error.message)
    }
})

module.exports = router