module.exports = function(app, jwt, connection) {

    var User = require('../models/user')(connection)

    app.get('/', function(req, res){
        res.render('index');
    });

    app.get('/restricted/home',function(req, res){
        res.render('webapp');
    });

    app.get('/partial/auth/:name', isLoggedIn, function (req, res) {
        var name = req.params.name;
        res.render('partials/auth/' + name);
    });

    app.get('/partial/:name', function (req, res) {
        var name = req.params.name;
        res.render('partials/' + name);
    });

    app.post('/authenticate',function(req, res) {
        var body = req.body;

        User.findOne({ username: body.username,
            password: body.password
        },function (err, user) {

            if (err){
                console.log(err);
                res.send(500, 'Internal Server Error');
                res.end();
            }

            if (!user){
                console.log("Username non trovato");
                res.send(401, 'Wrong user or password');
                res.end();
            }else{
                // We are sending the profile inside the token
                var token = jwt.sign(user, 'changeme', { expiresInMinutes: 60*5 });
                res.json({ token: token });
                res.end();
            }

        });
    });

    app.post('/signup',function(req, res) {
        var body = req.body;

        if(body.password!=body.check_password){
            res.send(403, 'Password and Check Password must be the same!');
            res.end();
        }

        User.findOne({ username: body.username
        },function(err, user) {

            if (err){
                res.send(500, 'Internal Server Error');
                res.end();
            }

            if (user) {
                res.send(403, 'Username already exist!');
                res.end();
            }else {
                var newUser = new User({ username: body.username,password:body.password})
                newUser.save(function (err, user) {
                    if (err){
                        res.send(500, 'Internal Server Error');
                        res.end();
                    }else{
                        res.send(200, 'Username is registered correctly!');
                        res.end();
                    }
                });
            }
        });

    });

    // process the signup form
    /*app.post('/api/signup', passport.authenticate('local-signup', {
        successRedirect : '/', // redirect to the secure profile section
        failureRedirect : '/#/register', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));*/


    app.get('/api/logout', isLoggedIn, function(req, res){
        req.logout();
        res.redirect('/');
    });

    function isLoggedIn(req, res, next) {

        // if user is authenticated in the session, carry on
        if (req.isAuthenticated())
            return next();

        // if they aren't redirect them to the home page
        res.redirect('/');
    }

}