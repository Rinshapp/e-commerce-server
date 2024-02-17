import express from "express";
import cors from "cors";
import connectDb from "./config/dbConnection.js";
import dotenv from "dotenv";
import { Product } from "./model/Product.js";
import { Admin } from "./model/adminModel.js";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken";
import { User } from "./model/userModel.js";
import multer from "multer";

const app = express();
connectDb();
dotenv.config();
app.use(cors())
app.use(express.json());
app.use('/api/images/uploads/',express.static(process.env.FILE_UPLOADING_PATH));


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
      cb(null, file.fieldname + '-' + uniqueSuffix + file.originalname)
    }
  })
  
  const upload = multer({ storage: storage })

//admin register
app.post('/api/admin/register',async(req,res)=>{
    try {
        const { fname, lname, email, password } = req.body
    
        if (!lname) {
            return res.status(400).json({ message: "lname is missing" })
        }
        if (!fname) {
            return res.status(400).json({ message: "fname is missing" })
        }
        if (!email) {
            return res.status(400).json({ message: "email is missing" })
        }
        if (!password) {
            return res.status(400).json({ message: "password is missing" })
        }

        const isMailExist = await Admin.findOne({email:email})

        if(!!isMailExist){
            return res.status(400).json({ message: "mail is exising , please enter another one" })
        }
  
        bcrypt.hash(req.body.password, 10, async(err, hash) => {
            const newAdmin = new Admin({
                email,fname,lname,password:hash,
            })

            const saveAdmin = await newAdmin.save();            
            
            if(saveAdmin){
                
                const { fname,lname,email,...others } = saveAdmin._doc;

                let userData = { fname, lname, email }

               return res.status(201).json({user:userData,message: 'successfully inserted admin into db' });
            }else{
               return res.status(400).json({user:saveAdmin,message: 'not inserted data into databse' });
            }
    })

    } catch (error) {
        return res.status(404).json({message: error.message || 'error' });      
    }
})

// admin login
app.post('/api/admin/login',async(req,res)=>{
    const { email, password } = req.body;
    if (!email) {
        return res.status(400).json({ message: "email is missing" })
    }
    if (!password) {
        return res.status(400).json({ message: "password is missing" })
    }

    const getAdmin = await Admin.findOne({email})

    if(!getAdmin){
       return res.status(400).json({ message: 'invalid email' })
    }
    bcrypt.compare(req.body.password, getAdmin.password).then(function (result) {
        
        if (result) {

            const token = jwt.sign({ userId: getAdmin._id,isAdmin:getAdmin.isAdmin  }, process.env.JWT_SECRET_KEY, {expiresIn:"10h"});

            const { fname,lname,email,...others } = getAdmin._doc;
            let userData = { fname, lname, email }

            return res.status(200).json({ users: userData, message: 'Successfull',token })
        } else {
            return res.status(400).json({ message: "Invalid Email or Password" })
        }
    });

})


//user register
app.post('/api/user/register',async(req,res)=>{
    try {
        const { fname, lname, email, password } = req.body
    
    
        if (!fname) {
            return res.status(400).json({ message: "fname is missing" })
        }
        if (!lname) {
            return res.status(400).json({ message: "lname is missing" })
        }
        if (!email) {
            return res.status(400).json({ message: "email is missing" })
        }
        if (!password) {
            return res.status(400).json({ message: "password is missing" })
        }

        const isMailExist = await User.findOne({email:email})

        console.log(isMailExist,'isMailExist')

        if(!!isMailExist){
            return res.status(400).json({ message: "mail is exising , please enter another one" })
        }

        console.log('object')
  
        bcrypt.hash(req.body.password, 10, async(err, hash) => {
            const newUser = new User({
                email,fname,lname,password:hash,
            })

            const saveUser = await newUser.save();  
            
            console.log(saveUser);
            console.log('saveUser');
      
            
            if(saveUser){
                
                const { fname,lname,email,...others } = saveUser._doc;

                let userData = { fname, lname, email }

               return res.status(201).json({user:userData,message: 'successfully inserted admin into db' });
            }else{
               return res.status(400).json({user:saveUser,message: 'not inserted data into databse' });
            }
    })

    } catch (error) {
        return res.status(404).json({message: error.message || 'error' });      
    }
})

// user login
app.post('/api/user/login',async(req,res)=>{
    const { email, password } = req.body;
    if (!email) {
        return res.status(400).json({ message: "email is missing" })
    }
    if (!password) {
        return res.status(400).json({ message: "password is missing" })
    }

    const getUser = await User.findOne({email})

    if(!getUser){
       return res.status(400).json({ message: 'invalid email' })
    }
    bcrypt.compare(req.body.password, getUser.password).then(function (result) {
        
        if (result) {

            const token = jwt.sign({ userId: getUser._id,isUser:getUser.isUser  }, process.env.JWT_SECRET_KEY, {expiresIn:"10h"});

            const { fname,lname,email,...others } = getUser._doc;
            let userData = { fname, lname, email }

            return res.status(200).json({ users: userData, message: 'Successfull',token })
        } else {
            return res.status(400).json({ message: "Invalid Email or Password" })
        }
    });

})



// create product
app.post('/api/products/',upload.single("productsPic"),async(req,res)=>{
    try {
        const { name, price, description, qunatity } = req.body

        if (!name) {
            return res.status(400).json({ message: "name is missing" })
        }
        if (!price) {
            return res.status(400).json({ message: "price is missing" })
        }
        if (!description) {
            return res.status(400).json({ message: "description is missing" })
        }
        if (!qunatity) {
            return res.status(400).json({ message: "quantity is missing" })
        }

        const isProducNameExist = await Product.findOne({name:name})

        if(!!isProducNameExist){
            return res.status(400).json({ message: "product name is exising , please enter another one" })
        }
        
        const newProduct = new Product({ name,description,price,qunatity,productPic:req.file.filename })

        const savedProduct = await newProduct.save();

       
        return res.status(201).json({product:savedProduct,message: 'successfully inserted product into db' });

    } catch (error) {
        return res.status(404).json({message: error.message || 'error' });      
    }
})


// fetch products from database
app.get("/api/products/",async(req,res)=>{
    const products = await Product.find();

    if (products.length === 0) {
        return res.status(404).json("no entries yet");
    } else {
        return res.status(200).json({ products: products });
    }
})

app.get("/api/products/:id",async(req,res)=>{
    if(!req.params.id) return res.status(400).json({message:'id not provided'})
    const product = await Product.findById(req.params.id);

    if (!product) {
        return res.status(404).json("no entries yet");
    } else {
        return res.status(200).json({ product: product });
    }
})

app.delete('/api/products/:id',async(req,res)=>{

    if(!Boolean(req.params.id)){
        return res.status(400).json({ message: "params not found" });
    }

    const response = await Product.findByIdAndDelete(req.params.id)

    if (response) {
        return res.status(200).json({ message: "deleted" });
    } else {
        return res.status(400).json({ message: "error in deleteting a product" });
    }
})

app.put('/api/products/:id',async(req,res)=>{
    console.log(req.params.id);

    if(!req.params.id){
        return res.status(400).json({ message: "no id" });
    }

    const update = await Product.findByIdAndUpdate(req.params.id,{$set:req.body})

    if (update) {
        return res.status(200).json({ message: "updated" });
    } else {
        return res.status(400).json({ message: "error in update of product" });
    }
})

// app.use("/api/products", produtRoute);
// app.use("/api/cart", 'adminRoute');
// app.use("/api/user", 'adminRoute');
// app.use("/api/orders", 'adminRoute');
// app.use("/api/payments", 'userRoute');
// app.use("*", error);


app.listen(process.env.PORT || 3000, () => {
    console.log(`server is running on PORT ${process.env.PORT || 3000}`);
})