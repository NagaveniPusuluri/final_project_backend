const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    role:{
        type:String,
        required:true
    },
    password: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }

}))

const teammembersSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phone: {
        type: Number,
        required: true
    },
    password:{
        type:String,
        required:true
    },
    role: {
        type: String,
        required: true
    },
    assignedChats:{
        type: Array,
        default:[]
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        required:true
    }
})


const User = mongoose.model('User', userSchema);
const Team =mongoose.model('Team',teammembersSchema)
module.exports = {User,Team};