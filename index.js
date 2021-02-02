const express = require("express");
const app = express();
const connectDB = require("./config/db")

app.use(express.json({extended: false}));

app.get("/", (req, res)=>{
    res.send("API is Running")
})

app.use("/users", require("./routes/users"));
app.use("/auth", require("./routes/auth"));
app.use("/profile", require("./routes/profile"));
app.use("/posts", require("./routes/post"));


connectDB();
const PORT = process.env.PORT || 5000;

app.listen(PORT, ()=>{
    console.log("server is running")
})