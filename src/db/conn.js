const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/registration', { 
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
})
.then(() => console.log("Connection Successful.."))
.catch((e) => console.log(e));