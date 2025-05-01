const mongoose=require('mongoose');

const messageSchema= new mongoose.Schema({
    sender:{
        type:String,
        required:true
    },
    receiver:{
        type:String,
        required:true
    },
    message:{
        type:String,
        required:true
    },
    createdAt:{
        type:Date,
        default:Date.now
    }
})

const customerSchema= new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    phone:{
        type:Number,
        required:true
    },
    createdAt:{
        type:Date,
        default:Date.now
    },
    status:{
        type:String,
        required:true,
        default:'NA'
    },
    assignedTo:{
        type:mongoose.Schema.Types.ObjectId
    },
    messages:[messageSchema],
    ticketNo:{
        type:String,
        required:true
    },
    isMissed:{
        type:Boolean,
        default:false
    }

})

const missedChatsSchema=new mongoose.Schema({
    day:{
        type:String,
        required:true
    },
    count:{
        type:Number,
        required:true
    }
})
const MissedChat=mongoose.model('MissedChat',missedChatsSchema);
const Customer=mongoose.model('Customer',customerSchema);
module.exports={Customer,MissedChat};
