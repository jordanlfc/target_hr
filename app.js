const express = require("express"),
    app = express(),
    methodOverride = require("method-override"),
    bodyParser = require("body-parser"),
    CookieParser = require('cookie-parser'),
    multer = require('multer'),
    cookieSession = require('cookie-session'),
    passport = require('passport'),
    mysql = require('mysql'),
    uploader = multer(),
    withcv = uploader.single('cvfile'),
    nodemailer = require("nodemailer");
    async = require("async"),
    crypto = require("crypto"),
    bcrypt = require('bcrypt-nodejs'),
    flash = require("connect-flash");


//port 
const port = process.env.PORT || 45000;


//app uses

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());


app.use(cookieSession({
    name: 'session',
    keys: ['key1', 'key2', 'key3'],
    maxAge: '36000000'
}))



// function getRandomInt(max) {
//     var randomNumber = Math.floor(Math.random() * Math.floor(max));
//     return randomNumber.toString()
// }


app.use(passport.initialize());
app.use(passport.session());
app.use(flash());


app.use(function (req, res, next) {
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});

// Parse JSON bodies (as sent by API clients)
app.use(express.json())

//view engine
app.set("view engine", "ejs");

//functions 


function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();

    res.redirect('/');
}





//multer engine
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, '/images/')
    },
    filename: function (req, file, cb) {
        cb(null, req.user.id + file.originalname)
    },

})

const upload = multer({
    storage: storage,
}).single('display');





//routes

app.get('/', (req, res) => {

    res.render('index')

});


app.get('/about', (req, res) => {

    res.render('about')

});

app.get('/jobs', (req, res) => {

    res.render('jobs')

});
app.get('/jobs-single', (req, res) => {

    res.render('jobs-single')

});



app.get('/blog', (req, res) => {

    res.render('blog')

});

app.get('/contact', (req, res) => {

    res.render('contact')

});

app.get('/contact', (req, res) => {

    res.render('contact')

});






app.listen(port, console.log(`server started on port ${port}`))