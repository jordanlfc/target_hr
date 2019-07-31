module.exports = function (app, passport) {


    app.post('/login', passport.authenticate('local-login', {
        successRedirect: '/admin',
        failureRedirect: 'back',
        failureFlash: true
    }),
        function (req, res) {
            if (req.body.remember) {
                req.session.cookie.maxAge = 1000 * 60 * 3;
            } else {
                req.session.cookie.expires = false;
            }
            res.redirect('/');
        })

    app.post('/business_signup', passport.authenticate('business-signup', {
        successRedirect: '/success',
        failureRedirect: '/fail',
        failureFlash: true

    }));


    app.get('/logout', function (req, res) {
        req.logout();
        res.redirect('/');
    })
}

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();

    res.redirect('/');
}
