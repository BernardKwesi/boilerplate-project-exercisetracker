const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const mongoose = require("mongoose")
const {Schema} = mongoose;
const bodyParser = require("body-parser");

mongoose.connect(process.env.MONGO_URI,  { useNewUrlParser: true, 
useUnifiedTopology: true });
const userSchema = new Schema({
  "username" : {type:String, unique:true}
});

const exerciseSchema = new Schema({
  userId: String,
  description : String,
  duration : Number,
  date :{ type: Date, default: Date.now }
})
const User = new mongoose.model('User', userSchema);
const Exercise = new mongoose.model('Exercise', exerciseSchema);

app.use(bodyParser.urlencoded({extended: false}));

app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.post("/api/users",(req,res)=>{

const username  = req.body.username;
const newUser = new User({username: username});

newUser.save((err,data)=>{
  if(err) return console.log(err);

  res.json({_id:data.id, username:data.username});

});

        
});

app.post("/api/users/:_id/exercises",(req,res)=>{

const userid = req.params._id;

let username ='';
 User.findById(userid,(err,data)=>{
if(err) res.json("User not found");

username =data.username;

});



const description = req.body.description;
const duration  = req.body.duration;
const date = req.body.date;
const exercise = new Exercise({
  userId: userid,
    description: description,
    duration : duration,
    date : date
});
    exercise.save((err,data)=>{
        if(err) return console.log(err);

        res.json({
          _id: data.userId,
          username :username,
          date : data.date.toDateString(),
          duration:data.duration,
    description:data.description
    
     
        });
    });

});

app.get("/api/users",(req,res)=>{

  
   User.find({},(err,data)=>{
     if(err) return res.send('No Users Found');

            res.send(data);
  });

});

app.get("/api/users/:_id/logs",(req,res)=>{

const userid = req.params._id;

const {from,to,limit} =req.query;

let exercises = [];
Exercise.find({userId:userid},{date:{$gte:new Date(from), $lte:new Date(to)}}).select(['description','duration','date']).limit(limit).exec((err,data)=>{
  if(err) return console.log(err);
  
data.map((exercise)=>{
  exercises.push(exercise);
});


 User.findById(userid,(err,data)=>{

if(!data)  res.send("user not found");
 
 const username = data.username;

 res.json({_id:userid,
  username:username
  , count:exercises.length
  , log:exercises.map(exercise =>{
    return ({description:exercise.description,duration:exercise.duration,date:exercise.date.toDateString()})
  })});
});

});

});



const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
