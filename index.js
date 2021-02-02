const express = require("express");
const app = express();
const connectDB = require("./config/db")

app.get("/", (req, res)=>{
    res.send("API is Running")
})

connectDB();
const PORT = process.env.PORT || 5000;

app.listen(PORT, ()=>{
    console.log("server is running")
})