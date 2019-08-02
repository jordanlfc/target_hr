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

require('./config/passport')(passport);

//database 
// const connection = mysql.createConnection({
//     host: 'localhost',
//     user: 'root',
//     password: 'admin',
//     database: 'target_database'
// })


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

    res.redirect('/login');
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
}).single('file');


require('./routes/routes.js')(app, passport);

//routes

app.get('/', (req, res) => {


    let iD = req.params.id

    let sql = `
    SELECT * FROM 
    blog 
    ORDER BY id 
    DESC LIMIT 0, 1`

    connection.query(sql, iD, (err, found) => {
        if (err) {
            req.flash('error', 'something went wrong')
            res.redirect('back')
        } else if (!found[0]) {
            res.render('index', { blog: [] })
        } else {
            console.log(found)
            res.render('index', { blog: found })
        }
    })

});

app.get('/admin', isLoggedIn,(req, res) => {


    let sql = `
    SELECT * FROM
    jobs
    `
    let sql2 = `
    SELECT * FROM
    blog
    `

    function blogFind(x) {
        connection.query(x, (err, found2) => {
            if (err) {
                req.flash('error', 'something went wrong')
                res.redirect('back')
            } else if (!found2[0]) {
                res.render('admin', {
                    blog: [],
                    job: []
                })
            } else {
                res.render('admin', {
                    blog: found2,
                    job: []
                })
            }
        })
    }
    function blogFind2(x, y) {
        connection.query(x, (err, found2) => {
            if (err) {
                req.flash('error', 'something went wrong')
                res.redirect('back')
            } else if (!found2[0]) {
                res.render('admin', {
                    blog: [],
                    job: y
                })
            } else {
                res.render('admin', {
                    blog: found2,
                    job: y
                })
            }
        })
    }


    connection.query(sql, (err, found) => {
        if (err) {
            req.flash('error', 'something went wrong')
            res.redirect('back')
        } else if (!found[0]) {
            blogFind(sql2)
        } else {
            blogFind2(sql2, found)
        }
    })
});


app.get('/new-admin', (req,res) => {
    res.render('newadmin')
})








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
            res.render('jobs', { job: [] })
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


app.get('/jobs-post', isLoggedIn, (req, res) => {

    res.render('postjob')

});

app.get('/edit-jobs:id', isLoggedIn, (req, res) => {


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

    let iD = req.params.id

    let sql = `
    SELECT * FROM
    blog 
    `

    connection.query(sql, iD, (err, found) => {
        if (err) {
            req.flash('error', 'something went wrong')
            res.redirect('back')
        } else if (!found[0]) {
            res.render('blog', { blogs: [] })
        } else {
            res.render('blog', { blogs: found })
        }
    })

});

app.get('/blog_:id', (req, res) => {

    let iD = req.params.id

    let sql = `
    SELECT * FROM
    blog 
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
            res.render('blog-single', { blog: found })
        }
    })


});

app.get('/blog-edit:id', isLoggedIn, (req, res) => {

    let iD = req.params.id

    let sql = `
    SELECT * FROM
    blog 
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
            res.render('blog-edit', { blog: found })
        }
    })


})




app.get('/contact', (req, res) => {

    res.render('contact')

});



app.get('/blog-post', isLoggedIn, (req, res) => {
    res.render('blogpost')
})

app.get('/login', (req, res) => {
    res.render('login')
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
        req.flash('success', 'subscribed')
        res.redirect('back')
    })
});

app.post('/new-job', isLoggedIn, (req, res) => {
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

    let mailTitle = data[0]

    connection.query(sql, data, (err, result) => {
        if (err) {
            req.flash('error', 'Post failed, please try again')
            res.redirect('back')
        }

    })

    subMailer(mailTitle)
    req.flash('success', 'Job Posted')
    res.redirect('back')
})

app.post('/edit-jobs:id', isLoggedIn, (req, res) => {
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
        req.flash('success', 'Job Posted')
        res.redirect('/admin')
    })
})



// app.post('/blog-post', (req,res) => {

//     res.send(req.body)

// })


app.post('/blog-post', isLoggedIn, upload, (req, res, err) => {

    let addToDatabase = (sql, data) => {
        connection.query(sql, data, (err, result) => {
            if (err) {
                return (
                    req.flash('error', 'something went wrong'),
                    res.redirect('back')
                )
            }
            req.flash('success', 'Blog post completed')
            res.redirect('back')
        })
    }

    let sql = `
    INSERT INTO
    blog(post_title,post_title2,picture_path,content_path,content_data)
    VALUES(?,?,?,?,?)
    `

    if (!req.file) {
        let data = [
            req.body.blog_title, req.body.blog_tagline, null, req.body.content, req.body.author
        ]
        addToDatabase(sql, data)
    } else {
        let data = [
            req.body.blog_title, req.body.blog_tagline, req.file.path, req.body.content, req.body.author
        ]
        addToDatabase(sql, data)
    }
});


app.post('/blog-edit:id', isLoggedIn, upload, (req, res, err) => {

    let addToDatabase = (sql, data) => {
        connection.query(sql, data, (err, result) => {
            if (err) {
                return (
                    req.flash('error', 'something went wrong'),
                    res.redirect('back')
                )
            }
            req.flash('success', 'Blog post completed')
            res.redirect('/blog')
        })
    }

    if (!req.file) {
        let sql = `UPDATE blog 
            SET 
            post_title = ?, post_title2 = ?, content_path = ?, content_data = ?
            WHERE id = ?`;
        let data = [
            req.body.blog_title, req.body.blog_tagline, req.body.content, req.body.author, req.params.id
        ]
        addToDatabase(sql, data)
    } else {
        let sql = `UPDATE blog 
            SET 
            post_title = ?, post_title2 = ?, picture_path = ? ,content_path = ?, content_data = ?
            WHERE id = ?`;
        let data = [
            req.body.blog_title, req.body.tagline, req.file.path, req.body.content, req.body.author, req.params.id
        ]
        addToDatabase(sql, data)
    }
})



app.post('/deletejob:id', isLoggedIn, (req, res) => {
    var id = req.params.id
    let sql = `DELETE FROM jobs 
    WHERE
    id = ?`
    let data = [
        id
    ]
    connection.query(sql, data, (err, user, results) => {
        if (err) {
            res.send(results)
        }
        res.redirect('/admin')
    })
});

app.post('/deleteblog:id', isLoggedIn, (req, res) => {
    var id = req.params.id
    let sql = `DELETE FROM blog
    WHERE
    id = ?`
    let data = [
        id
    ]
    connection.query(sql, data, (err, user, results) => {
        if (err) {
            req.flash('error', 'Failed')
            res.redirect('back')
        }
        req.flash('Success', 'Post Deleted')
        res.redirect('/admin')
    })
});






// app.post('/vid', (req, res) => {
//     upload2(req, res, (err) => {
//         if (err) {
//             res.redirect('back')
//         } else {
//             let sql = `UPDATE users 
//             SET 
//             video_path = ?
//             WHERE id = ?`;

//             let data = [
//                 req.file.path, req.user.id
//             ];

//             // execute the UPDATE statement
//             connection.query(sql, data, (err, results) => {
//                 if (err) {
//                     res.send(err);
//                 }
//                 res.redirect('back')
//             })
//         }
//     })
// });


app.post('/apply', withcv, (req, res) => {

    if (!req.file) {
        return (
            req.flash('error', 'You must upload your résumé'),
            res.redirect('back')
        )
    }

    const cv = req.file;


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


        let info = await transporter.sendMail({
            from: `<${req.body.email}>`,
            to: "admin@targeted-hr.com",
            subject: `Application - ${req.body.job_title}`,
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

app.post('/contact', (req, res) => {

    if(!req.body.name || !req.body.email || !req.body.phone || !req.body.message){
        return(
        req.flash('error','Message Failed'),
        res.redirect('back')
        )
    }


    const output = `
    <p>You have a contact request from '${req.body.name} </p>
    <h3>Contact Details<h3>
    <ul>
        <li>Name: ${req.body.name}</li>
        <li>Email: ${req.body.email}</li>
        <li>Number: ${req.body.phone}</li>
        <li>Subject: ${req.body.subject}</li>
    <ul>

    <h3> Message </h3>
    <p>${req.body.message}</p>
    `

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


        let info = await transporter.sendMail({
            from: `<${req.body.email}>`,
            to: "admin@targeted-hr.com",
            subject: `Contact Request - ${req.body.subject}`,
            html: output,

        });


    }
    main().catch(console.error);
    req.flash('success', 'Message Sent')
    res.redirect('back')

});


function testmail(x, y) {


    const output = `
    <h3>You have a new job alert from Targeted HR</h3>
    
    <h3>Job Title - ${y}

    <p>For full information please visit http://localhost:45000/jobs

    `



    var smtpTransport = nodemailer.createTransport({
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

    var mailOptions = {
        to: x,
        from: 'mailer@targeted-hr.com',
        subject: 'Job Alert from Targeted-HR',
        html: output
    }
    smtpTransport.sendMail(mailOptions, function (err) {
        console.log('success', 'An e-mail has been sent');
    });

}


function subMailer(y) {
    let sql = `
    SELECT email FROM 
    subscription
    `
    connection.query(sql, (err, result) => {
        var emailList = Array.from(result)
        for (var i = 0; i < emailList.length; i++) {
            testmail(emailList[i].email, y)
        }
    })
}




app.listen(port, console.log(`server started on port ${port}`))