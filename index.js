const express= require('express');
const app=express();
const env=require('dotenv');

const moongoose=require('mongoose')

const cors =require('cors');
const userRouter=require('./routes/user');
const customerRouter=require('./routes/customer');
env.config();
const port =process.env.PORT||8005;

// app.use(express.json())
app.use(cors({
<<<<<<< HEAD
    origin:'*'
=======
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
>>>>>>> 3fabc35b82e73db83b582eb6dcc12ca6a11bfc3b
}))
app.use(express.json()); 

// app.use('/',userRouter)
app.use('/customer',customerRouter);
app.use('/user', userRouter)
app.use('/customer', customerRouter)
app.listen(port,'0.0.0.0',()=>{
    console.log(`server is listening to port ${port}`);
    moongoose.connect(process.env.MONGO_URL).then(()=>{
        console.log('connected to mongo db')
    }).catch((err)=>{
        console.log(err);
    })
})
