module.exports = function(app, passport, db) {

// normal routes ===============================================================

    // show the home page (will also have our login links)
    app.get('/', function(req, res) {
        db.collection('plays').findOne(
            {},
            { sort: { _id: -1 } },
            (err, data) => {
               console.log(data);
               res.render('game.ejs', {
                data: data
            })
            },
        );
    });

    // PROFILE SECTION =========================
    app.get('/profits', function(req, res) {
        db.collection('plays').find('').toArray((err, result) => {
          if (err) return console.log(err)
          res.render('profit.ejs', {
            plays: result
            })
        })
    });

    // GAME SCREEN =============================

    //datatbase = [bet, guess, outcome]
    app.post('/game', function(req, res){
        //randomly choose red or black (50/50)
        let number = Math.round(Math.random()*36)
        number = number.toString() //bc user guess will always be stored as a string 
        let color = undefined
        number === 1 || 3 || 5 || 7 || 9 || 12 || 14 || 16 || 18 || 19 || 21  || 23 || 25 || 27 | 30 || 32 || 34 || 36 ? color = 'red' : color = 'black'
        let win = false
        let total = 0

        //if guess === color then win 
        //if guess === number then win
        req.body.guess === color ? (win = true, total = `+${req.body.bet}`): req.body.guess === number ? (win = true, total = `+${req.body.bet}`) : (win = false, total = -req.body.bet)

        db.collection('plays').insertOne({bet: req.body.bet, guess: req.body.guess, color: color, number: number, win: win, total: total}, (err, result) => {
            if (err) return console.log(err)
            console.log('saved to database')
            res.redirect('/')
        })
    })

    // LOGOUT ==============================
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });


// =============================================================================
// AUTHENTICATE (FIRST LOGIN) ==================================================
// =============================================================================

    // locally --------------------------------
        // LOGIN ===============================
        // show the login form
        app.get('/login', function(req, res) {
            res.render('login.ejs', { message: req.flash('loginMessage') });
        });

        // process the login form
        app.post('/login', passport.authenticate('local-login', {
            successRedirect : '/profile', // redirect to the secure profile section
            failureRedirect : '/login', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));

        // SIGNUP =================================
        // show the signup form
        app.get('/signup', function(req, res) {
            res.render('signup.ejs', { message: req.flash('signupMessage') });
        });

        // process the signup form
        app.post('/signup', passport.authenticate('local-signup', {
            successRedirect : '/profile', // redirect to the secure profile section
            failureRedirect : '/signup', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));

// =============================================================================
// UNLINK ACCOUNTS =============================================================
// =============================================================================
// used to unlink accounts. for social accounts, just remove the token
// for local account, remove email and password
// user account will stay active in case they want to reconnect in the future

    // local -----------------------------------
    app.get('/unlink/local', isLoggedIn, function(req, res) {
        var user            = req.user;
        user.local.email    = undefined;
        user.local.password = undefined;
        user.save(function(err) {
            res.redirect('/profile');
        });
    });

};

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();

    res.redirect('/');
}
