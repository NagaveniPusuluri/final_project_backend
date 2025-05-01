const mongoose = require('mongoose');
const { User, Team } = require('../model/user.schema');
const Customer=require('../model/customer.schema');
const bcrypt = require('bcrypt');
const express = require('express');

const router = express.Router();
const jwt = require('jsonwebtoken');
const authMiddleware = require('../Middleware/authMiddleware');

// router.get('/',(req,res)=>{
//     res.status(200).json({message:'Server is up & running'});
// })

router.post('/signup',async (req, res) => {
    const { firstName, lastName, email, role, password, confirmPassword, agree } = req.body;
    console.log(req.body);
    try {
        const existingUser = await User.findOne({ email });
        
        if (existingUser) {
            return res.status(400).json({ message: 'User already in use' });
        }
        if (password !== confirmPassword) {
            return res.status(400).json({ message: 'Passwords do not match' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({
            firstName,
            lastName,
            email,
            role,
            password: hashedPassword

        })

        res.status(201).json({
            message: "User registered successfully"
        });

    } catch (err) {
        console.log(err);
        res.status(500).send("Internal server error", err)
    }
})

router.post('/login',async (req, res) => {
    const { username, password } = req.body;
    console.log(req.body);

    try {
        let user = await User.findOne({ email: username });
     
          let member= await Team.findOne({email:username})
          console.log(user, member)

        if (!user && !member){
            
            return res.status(400).send("User not found");
        }
        if(!user){
            user=member
        }
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            res.status(401).send("Invalid Credentials")
        }
        const token=jwt.sign({
            _id:user._id
        },process.env.SECRET,{
            expiresIn:"1d"
        })
        res.status(200).json({ message:"User successfully logged",token, user:user});
    } catch (err) {
        console.log(err);
        res.status(500).send("internal server error", err);
    }
})

router.post('/add-teammembers', authMiddleware, async (req, res) => {
    console.log(req.body)
    try {

        const { username, phone, email, password, role, createdBy, assignedChats } = req.body;
        if (!username || !phone || !email || !password || !role ) {
            return res.status(400).send("All fields are required");
        }
        const hashedPassword=await bcrypt.hash(password,10)
        const team = await Team.create({
            username:username,
            phone:phone,
            email:email,
            password:hashedPassword,
            role:role,
            createdBy:createdBy,
            assignedChats:assignedChats
        })
        res.status(201).json({ message: "Team member added successfully" })

    } catch (err) {
        console.log(err);
        res.status(500).send("Internal server error", err)
    }
})

router.get('/add-teammembers/:id', authMiddleware,async (req, res) => {
    const {id}=req.params;

    try {
        const teamMembers = await Team.find({createdBy:id});
        res.status(200).json(teamMembers);
    } catch (err) {
        console.log(err);
        res.status(500).send("Internal server error", err)
    }
})


router.delete('/add-teammembers/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;
    try {
        const teamMember = await Team.findByIdAndDelete(id);
        if (!teamMember) {
            return res.status(400).send("Team member not found");
        }
        res.status(200).json({ message: "Team member deleted successfully" })
    } catch (err) {
        console.log(err);
        res.status(500).send("Internal server error", err)
    }
})

router.put('/add-teammembers/:id',authMiddleware,async(req,res)=>{
    const{id}=req.params;
    console.log(id);
    console.log(req.body);
    const {username,phone,email,role}=req.body;
    try{
        const teamMember=await Team.findByIdAndUpdate(id,{username,phone,email,role},{new:true})
        if(!teamMember){
            return res.status(400).send("Team member not found");
            }
            res.status(200).json({message:"Team member updated successfully"})
    }catch(err){
        console.log(err);
        res.status(500).send("Internal server error",err)
    }
})

router.get('/message/update',authMiddleware,async(req,res)=>{

    const {ticketId, memberId}=req.query;
    console.log(req.query);
    console.log(ticketId,memberId)
    const member= await Team.findById(memberId)
    const ticket=await Customer.findById(ticketId)
    member.assignedChats.push({id:ticketId})
    ticket.assignedTo=memberId
    await member.save();
    await ticket.save();
    res.status(200).json({message:"Assigned chat successfully", assignedTo:member, assignedChat:ticket });

})


router.put('/update/:id',authMiddleware,async(req,res)=>{
    const{id}=req.params;
    const { firstName, lastName, email, role, password, confirmPassword}=req.body;
console.log(req.body);
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).send("Invalid user ID");
    }

    try{
        let updatedData={firstName,lastName,email};
        
        if (typeof password === 'string' && password.trim() !== '') {
            const hashedPassword = await bcrypt.hash(password, 10);
            updatedData.password = hashedPassword;
          }
        if (role === 'admin'){
         updatedUser=await User.findByIdAndUpdate(id,updatedData,{new:true});
        } else if (role=== 'teammember'){
            updatedUser= await Team.findByIdAndUpdate(id, updatedData,{new:true});
        }else{
            return res.status(400).json({error:"Invalid role provided"});
        }
        if(!updatedUser){
            return res.status(404).json({error:"User not found"});
        }
        res.status(200).json({message:"User updated successfully", user:updatedUser})
    
    }catch(err){
        console.log(err, err.message );
        res.status(500).send("internal server error", err.message)
    }

})


module.exports = router;
