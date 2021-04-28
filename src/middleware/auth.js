const jwt = require("jsonwebtoken");
const Register = require("../models/registers");

const auth = async (req, res, next) => {
    try {
        const token = req.cookies.jwt;
        const userVerify = jwt.verify(token, process.env.SECRETKEY);
        const user = await Register.findOne({_id: userVerify._id});
        req.token = token;
        req.user = user;
        next();
    } catch(e){
        res.status(401).send(e);
    }
};

module.exports = auth;