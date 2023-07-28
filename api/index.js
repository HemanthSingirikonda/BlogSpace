const express=require('express');
const cors=require('cors');
const { default: mongoose } = require('mongoose');
const dotenv=require('dotenv')
const User=require('./models/User');
const app=express();
const bcrypt = require('bcryptjs');
const salt = bcrypt.genSaltSync(10);
const jwt=require('jsonwebtoken');
const cookieParser=require('cookie-parser');
const multer  = require('multer')
const uploadMiddleware = multer({ dest: 'uploads/' })
const fs=require('fs');
const PostModel = require('./models/PostModel');
const { log } = require('console');

dotenv.config();

const secret=process.env.SECRET;

app.use(cors({credentials:true,origin:'http://localhost:3000'}));
app.use(express.json());
app.use(cookieParser());
app.use('/uploads',express.static(__dirname+'/uploads'));

mongoose.connect(process.env.MONGO_URL);

app.post('/register',async (req,res)=>{
    // console.log('ok');
    // res.json('test ok');
    const {username,password}=req.body;
    try{
        const userDoc=await User.create({
            username,
            password:bcrypt.hashSync(password, salt),
        });
        res.json(userDoc);
    }catch(e){
        res.status(400).json(e);
    }
    
    
})

app.post('/login',async (req,res)=>{
    const {username,password}=req.body;
    const userDoc=await User.findOne({username});
    // res.json(userDoc);
    const passOk= bcrypt.compareSync(password,userDoc.password);
    // res.json(passOk);
    if(passOk){
        jwt.sign({username,id:userDoc._id},secret,{},(err,token)=>{
            if(err)throw err;
            // res.json(token);
            res.cookie('token',token).json({
                username,
                id:userDoc._id,
            });
        })
    }
    else{
        res.status(400).json('wrong credentials');
    }
})

app.get('/profile',(req,res)=>{
    // res.json(req.cookies)
    const {token}=req.cookies;
    jwt.verify(token,secret,{},(err,info)=>{
        if(err)throw err;
        res.json(info); 
    })
})

app.post('/logout',(req,res)=>{
    res.cookie('token','').json('ok');
})

app.post('/post',uploadMiddleware.single('file'),async(req,res)=>{
    const {title,summary,content}=req.body;
    const {originalname,path}=req.file;
    const parts=originalname.split('.');
    const ext=parts[parts.length-1];
    const newPath=path+'.'+ext;
    fs.renameSync(path,newPath);
    const {token}=req.cookies;

    jwt.verify(token,secret,{},async (err,info)=>{
        if(err)throw err;
        const postDoc=await PostModel.create({
            title,summary,content,
            cover:newPath,
            author: info.id,
        })
        res.json(postDoc);    
    })

            
    // res.json({files: req.file})
})

app.get('/post',async (req,res)=>{
    const posts=await PostModel.find().populate('author',['username']).sort({createdAt:-1}).limit(20);  
    res.json(posts);
})

app.get(`/post/:id`,async(req,res)=>{
    const {id}=req.params;
    try{
        const postDoc=await PostModel.findById(id).populate('author',['username']);
        res.json(postDoc);
    }catch(e){
        res.status(400).json(e);
    }
    


})

app.post(`/edit/:id`,uploadMiddleware.single('file'),async(req,res)=>{
    const {id}=req.params;
    const {title,summary,content}=req.body;
    let newPath=null;
    if(req.file){
        const {originalname,path}=req.file;
        const parts=originalname.split('.');
        const ext=parts[parts.length-1];
        newPath=path+'.'+ext;
        fs.renameSync(path,newPath);
    } 
    const {token}=req.cookies; 
    // res.json('ok');  

    

    jwt.verify(token,secret,{},async (err,info)=>{
        if(err)throw err;
        const postDoc=await PostModel.findById(id);
        const isAuthor= JSON.stringify(postDoc.author)===JSON.stringify(info.id);
        if(!isAuthor){
            return res.status(400).json('you are not the author of this post')
        }
        const filter={_id:id};
        const update={title,
            summary,
            content,
            cover:newPath?newPath:postDoc.cover
        }
        const updatedPostDoc=await PostModel.findOneAndUpdate(filter,update,{
            returnOriginal: false
        });
          
        res.json(updatedPostDoc);
        // res.json('ok');
    })

    // res.json(postDoc);    

})

app.get('/test',(req,res)=>res.json('ok'));

app.listen(4000);
