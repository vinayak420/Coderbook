const express = require("express");
const router = express.Router();

//@route GET api/post
//desc Test route
//access public
router.get("/", (req, res)=>{
    res.send("post route");
})

module.exports = router