const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const employeeSchema = new mongoose.Schema({
    firstname: {
        type: String,
        required: true
    },
    lastname: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    phone: {
        type: Number,
        required: true,
        unique: true,
        min: 10
    },
    age: {
        type: Number,
        required: true
    },
    gender: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }, 
    confirmpassword: {
        type: String,
        required: true
    },
    tokens:[{
        token: {
            type: String,
            required: true
        }
    }]
});

// create jwt token
employeeSchema.methods.generateAuthToken = async function() {
    try {
        const token = await jwt.sign({_id:this._id.toString()}, process.env.SECRETKEY);
        this.tokens = this.tokens.concat({token: token});
        await this.save();
        return token;
    } catch(e) {
        console.log(e);
    }

};

// converting password into hash
employeeSchema.pre("save", async function(next) {
    if(this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, 10);
        this.confirmpassword = await bcrypt.hash(this.password, 10);
    }
    next();
});

//create a register collection
const Register = new mongoose.model("Register", employeeSchema);

module.exports = Register;