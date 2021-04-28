require('dotenv').config();
const express = require("express");
const path = require("path");
const hbs = require("hbs");
const bcrypt = require("bcrypt");
const cookieParser = require('cookie-parser');
const auth = require("./middleware/auth");

require("./db/conn");
const Register = require("./models/registers");
const port = process.env.PORT || 3000;

const app = express();

const static_path = path.join(__dirname, "../public"); 
const template_path = path.join(__dirname, "../templates/views"); 
const partials_path = path.join(__dirname, "../templates/partials"); 

app.use(express.json());
app.use(express.urlencoded({extended:false}));
app.use(cookieParser());

app.use(express.static(static_path));
app.set("view engine", "hbs");
app.set("views", template_path);
hbs.registerPartials(partials_path);

app.get('/', (req, res) => {
  res.render("index");
});

app.get('/secret', auth, (req, res) => {
    res.render("secret");
});

//logput
app.get('/logout', auth, async(req, res) => {
    try {
        res.clearCookie('jwt');
        req.user.tokens =  req.user.tokens.filter((ele) => {
            return ele.token !== req.token
        });
        await req.user.save();
        res.render('login');
    }catch(e) {
        res.status(500).send(e);
    }
 });
 

app.get('/register', (req, res) => {
    res.render('register');
});

app.get('/login', (req, res) => {
    res.render('login');
});

// Save data into database
app.post('/register', async (req, res) => {
    try {
        const password = req.body.password;
        const cpassword = req.body.confirmpassword;
        if(password === cpassword) {
            const empRegister = new Register({
                firstname: req.body.firstname,
                lastname: req.body.lastname,
                email: req.body.email,
                phone: req.body.phone,
                age: req.body.age,
                gender: req.body.gender,
                password: password,
                confirmpassword: cpassword
            });

            const token = await empRegister.generateAuthToken();
            res.cookie("jwt", token, {
                expires:new Date(Date.now() + 30000),
                httpOnly: true                
            });
            const result = await empRegister.save();
            res.status(201).render("index")

        } else {
            res.status(500).send("Password is not matching");
        }
    } catch(e) {
        res.status(500).send("Error ==> "+ e);
    }
});

//login check
app.post('/login', async (req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;
        const userData = await Register.findOne({email:email});
        const token = await userData.generateAuthToken();
        res.cookie("jwt", token, {
            expires:new Date(Date.now() + (600 * 1000)), // 10 min
            httpOnly: true                
        });
        if(await bcrypt.compare(password, userData.password)) {
            res.status(201).render("index");
        } else {
            res.status(400).send("Password is incorrect!");
        }
    } catch(e){
        res.status(400).send("Email is not registered with us!");
    }
});




/* const securePassword = async (password) => {
    const passwordHash = await bcrypt.hash(password, 10);
    console.log(passwordHash);

    const passwordMatch = await bcrypt.compare(password, passwordHash);
    console.log(passwordMatch);
}; 

securePassword("Anand"); */

/* const jwt = require("jsonwebtoken");

const createToken = async () => {
    const token = await jwt.sign({_id:"6085b224a060992f584a7270"}, "zxcvbnmasdfghjklqwertyuiopzxcvbnm", {expiresIn: "2 seconds"});
    console.log(token);

    const userVerify = await jwt.verify(token, "zxcvbnmasdfghjklqwertyuiopzxcvbnm");
    console.log(userVerify);
};

createToken(); */


app.listen(port, () => {
    console.log(`server running at ${port}`);
});