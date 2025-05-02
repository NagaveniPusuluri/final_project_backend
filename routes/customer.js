const {Customer,MissedChat} = require('../model/customer.schema');
const { Team } = require('../model/user.schema');
const express = require('express');
const router = express.Router();
const authMiddleware=require('../Middleware/authMiddleware');

router.post('/',authMiddleware, async (req, res) => {
    console.log(req.body)
    try {
        const { name, email, phone, status, messages, assignedTo,ticketNo } = req.body;
        const customer = await Customer.create({
            name,
            email,
            phone,
            status,
            messages,
            assignedTo,
            ticketNo
        })
        res.status(200).json(customer);
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})

router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const selectedCustomer = await Customer.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        )
        if (!selectedCustomer) {
            return res.status(404).json({ message: 'Customer not found' });
        }
        res.status(200).json({ message: 'Customer status updated successfully', customer: selectedCustomer });
    } catch (err) {
        console.log(err.message)
        res.status(500).json({ message: err.message });
    }
})

router.post('/add-message' ,async (req, res) => {
    try {
        const { id, message } = req.body;
        console.log(id, message)
        if (!id || !message) {
            return res.status(400).json({ message: 'Please provide id and message' })
        }
        const customer = await Customer.findById(id);
        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' })
        }
        customer.messages.push(message);
        const result = await customer.save();
        res.status(200).json({ message: "message saved successfully", result: result });

    } catch (err) {
        console.error(err)
        res.status(500).json({ error: "internal server error", err: err })

    }
})

router.put('/update-status', authMiddleware ,async (req, res) => {
    try {
        const { id, status } = req.body;

        // Validate input
        if (!id || !status) {
            return res.status(400).json({ message: 'Please provide both id and status.' });
        }

        // Validate status value
        const validStatuses = ['resolved', 'unresolved'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: 'Status must be either "resolved" or "unresolved".' });
        }

        // Find and update customer ticket status
        const customer = await Customer.findByIdAndUpdate(
            id,
            { status: status },
            { new: true }
        );

        if (!customer) {
            return res.status(404).json({ message: 'Customer not found.' });
        }

        res.status(200).json({
            message: 'Ticket status updated successfully.',
            updatedCustomer: customer
        });

    } catch (err) {
        console.error('Error updating ticket status:', err);
        res.status(500).json({ message: 'Internal server error.', error: err });
        }
});


router.get('/',authMiddleware,async (req, res) => {
    try {
        const customer = await Customer.find()

        res.status(200).json(customer);
    } catch (err) {
        
         res.status(500).json({ message: err.message })
        // next(err);
    }
})

router.get('/teammember/messages/:id', authMiddleware,async (req, res) => {
    try {
        const { id } = req.params;
        console.log(id);
        
        const member = await Team.findById(id);
        const objectId = member.assignedChats.map(item => item.id)
        console.log(objectId);
        console.log(member)
        if (!member) {
            return res.status(404).json({ message: 'Team member not found' });
        }
        
        const messages = await Customer.find({ _id: { $in: objectId } })
        res.status(200).json({ message: "Team member messages fetched succesfully.", data: messages })

    } catch (err) {
        console.log(err.message);
        res.status(500).json({ message: err.message, data: err })
    }
})

router.post('/update-missed',authMiddleware,async(req,res)=>{
    try{
        const{id, day}=req.body;
        const ticket=await Customer.findById(id);
        const exist=await MissedChat.findOne({day:day});
        if(exist){
            exist.count+=1;
            
        await exist.save();
        }else{
            const newDay=new MissedChat({
                day:day,
                count:1
            }) 
            await newDay.save();
        }
        ticket.isMissed=true;
        const result= await ticket.save();
        res.status(200).json({message:"Missed chat is updated successfully", data:result});

    }catch(err){
        console.log(err.message);
        res.status(500).json({ message: err.message, data: err })
    }
})

router.get("/get-missed-chats",authMiddleware,async(req,res)=>{
    try{
        const result=await MissedChat.find()
        res.status(200).json({message:"Fetched missed chats successfully" , data:result})
    }catch(err){
        console.log(err.message);
        res.status(500).json({ message: err.message, data: err })
    }
})


module.exports = router;
