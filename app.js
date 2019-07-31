const express = require("express"),
    app = express(),
    methodOverride = require("method-override"),
    bodyParser = require("body-parser"),
    multer = require('multer'),
    cookieSession = require('cookie-session'),
    passport = require('passport'),
    mysql = require('mysql'),
    uploader = multer(),
    withcv = uploader.single('file'),
    nodemailer = require("nodemailer");
    async = require("async"),
    crypto = require("crypto"),
    bcrypt = require('bcrypt-nodejs'),
    flash = require("connect-flash");


//port 
const port = process.env.PORT || 45000;

//database 
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'admin',
    database: 'target_database'
})


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
        cb(null, 'public/uploads/')
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    },

})

const upload = multer({
    storage: storage,
}).array('files[]', 2);





//routes

app.get('/', (req, res) => {
    res.render('index')

});


app.get('/about', (req, res) => {

    res.render('about')

});

app.get('/jobs', (req, res) => {


    let sql = `
    SELECT * FROM
    jobs 
    `

    connection.query(sql, (err, found) => {
        if (err) {
            req.flash('error', 'something went wrong')
            res.redirect('back')
        } else if (!found[0]) {
            req.flash('error', 'something went wrong')
            res.redirect('/')
        } else {
            res.render('jobs', { job: found })
        }
    })

});
app.get('/jobs-single:id', (req, res) => {

    let iD = req.params.id

    let sql = `
    SELECT * FROM
    jobs 
    WHERE id = ? 
    `

    connection.query(sql, iD, (err, found) => {
        if (err) {
            req.flash('error', 'something went wrong')
            res.redirect('back')
        } else if (!found[0]) {
            req.flash('error', 'something went wrong')
            res.redirect('/')
        } else {
            res.render('jobs-single', { job: found })
        }
    })


});
app.get('/jobs-post', (req, res) => {

    res.render('postjob')

});

app.get('/edit-jobs:id', (req, res) => {


    let iD = req.params.id

    let sql = `
    SELECT * FROM
    jobs 
    WHERE id = ? 
    `

    connection.query(sql, iD, (err, found) => {
        if (err) {
            req.flash('error', 'something went wrong')
            res.redirect('back')
        } else if (!found[0]) {
            req.flash('error', 'something went wrong')
            res.redirect('/')
        } else {
            res.render('editjob', { job: found })
        }
    })



})



app.get('/blog', (req, res) => {

    res.render('blog')

});

app.get('/blog_:id', (req, res) => {

    res.render('blog-single')

});



app.get('/contact', (req, res) => {

    res.render('contact')

});

app.get('/contact', (req, res) => {

    res.render('contact')

});


app.get('/blog-post', (req,res) => {
    res.render('blogpost')
})


//post requests 



app.post('/subscribe', (req, res) => {

    if (req.body.name.length <= 1 || req.body.email.length <= 1) {
        return (
            req.flash('error', 'Please enter your name & email'),
            res.redirect('/')
        )
    }

    let sql = `
    INSERT INTO 
    subscription(name,email)
    VALUES(?,?)`

    let data = [
        req.body.name,
        req.body.email
    ]

    connection.query(sql, data, (err, result) => {
        if (err) {
            req.flash('error', 'Sign up failed. Please try again.')
            res.redirect('back')
        }
        console.log(result)
        req.flash('success', 'subscribed')
        res.redirect('back')
    })
});

app.post('/new-job', (req, res) => {
    let sql = `
    INSERT INTO 
    jobs(job_title,job_salary,job_location,start_date,job_type, description, contact)
    VALUES(?,?,?,?,?,?,?)
    `

    let data = [
        req.body.job_title,
        req.body.salary,
        req.body.location,
        req.body.start_date,
        req.body.type,
        req.body.description,
        req.body.contact
    ]

    connection.query(sql, data, (err, result) => {
        if (err) {
            req.flash('error', 'Post failed, please try again')
            res.redirect('back')
        }
        console.log(result)
        req.flash('success', 'Job Posted')
        res.redirect('back')
    })
})

app.post('/edit-jobs:id', (req, res) => {
    let sql = `
    UPDATE
    jobs 
    SET 
    job_title = ?,job_salary = ? ,job_location =? ,start_date =? ,job_type =? , description =?, contact =?
    WHERE id = ?
    `;

    let data = [
        req.body.job_title,
        req.body.salary,
        req.body.location,
        req.body.start_date,
        req.body.type,
        req.body.description,
        req.body.contact,
        req.params.id
    ]


    connection.query(sql, data, (err, result) => {
        if (err) {
            req.flash('error', 'Post failed, please try again')
            res.redirect('back')
        }
        console.log(result)
        req.flash('success', 'Job Posted')
        res.redirect('/admin')
    })
})



// app.post('/blog-post', (req,res) => {

//     res.send(req.body)

// })


app.post('/blog-post', upload, (req, res, err) => {
    res.send(req.files)
});



app.post('/vid', (req, res) => {
    upload2(req, res, (err) => {
        if (err) {
            res.redirect('back')
        } else {
            let sql = `UPDATE users 
            SET 
            video_path = ?
            WHERE id = ?`;

            let data = [
                req.file.path, req.user.id
            ];

            // execute the UPDATE statement
            connection.query(sql, data, (err, results) => {
                if (err) {
                    res.send(err);
                }
                res.redirect('back')
            })
        }
    })
});












app.post('/apply', withcv, (req, res) => {

    if(!req.file){
        return(
            req.flash('error', 'You must upload your résumé'),
            res.redirect('back')
        )
    }

    const cv = req.file;
    console.log(cv)


    const output = `
    <p>You have a new cv from '${req.body.name} </p>
    <h3>Contact Details<h3>
    <ul>
        <li>Name: ${req.body.name}</li>
        <li>Email: ${req.body.email}</li>
        <li>Number: ${req.body.phone}</li>
        <li>City: ${req.body.locations}</li>
    <ul>
    
    `

    console.log(output)

    async function main() {

        let transporter = nodemailer.createTransport({
            host: "az1-ss22.a2hosting.com",
            port: 465,
            secure: true, 
            auth: {
                user: 'mailer@targeted-hr.com', 
                pass: 'admin1289' 
            },
            tls: {
                rejectUnauthorized: false
            }
        });

        console.log('this far')

        
        let info = await transporter.sendMail({
            from: `<${req.body.email}>`,
            to: "admin@targeted-hr.com",
            subject: `Application - ${req.body.job_title}`,
            cc: `${req.file.filename}`,
            html: output,
            attachments: [{
                filename: cv.originalname,
                contentType: cv.mimetype,
                encoding: cv.encoding,
                content: cv.buffer
            }]

        });


    }
    main().catch(console.error);
    req.flash('success', 'Message Sent')
    res.redirect('back')

});








app.listen(port, console.log(`server started on port ${port}`))