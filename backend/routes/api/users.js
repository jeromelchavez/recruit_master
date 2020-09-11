const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const keys = require('../../config/keys');
// const {forwardAuthenticated} = require('../../config/auth');

// Users Model

const User = require('../../models/User')

//Register
router.post('/register', (req, res) => {
    const {name, email, password, password2} = req.body;
    let errors = [];

    if(!name || !email || !password || !password2){
        errors.push({msg: 'Input all fields'})
    }

    if(password !== password2){
        errors.push({msg: 'Passwords do not match'});
    }

    if(errors.length > 0){
        res.status(400).send(errors);
    } else {
        User.findOne({email: email})
            .then(user => {
                if(user){
                    errors.push({msg: 'User already exists.'})
                    res.status(400).send(errors);
                } else {
                    const newUser = new User({ name, email, password });

                    bcrypt.genSalt(10, (err, salt) => bcrypt.hash(newUser.password,salt, (err, hash) => {
                        if(err) throw err;

                        newUser.password = hash;

                        newUser.save()
                            .then(res.send({msg: 'Success'}))
                            .catch(err => console.log(err));
                    }))
                }
            })
    }

})

//Login
router.post('/login', (req, res, next) => {
   passport.authenticate('local-login',(err, user, info) => {
        if (err) throw err;
        if (!user) {
            return res.status(400).send({msg:"Login error"});
        }
        req.logIn(user, function(err) {
            if (err) { return next(err); }
            const token = jwt.sign({id: user.email}, keys.jwt.secret, {expiresIn: 10});
            return res.send({
                auth: true,
                token,
                msg: 'Login success'
            });
        });
   })(req, res, next);
});


//JWT Test
router.post('/test', (req,res,next) => {
    passport.authenticate('jwt', { session: false }, (err, user, info) => {
        if (err) { return next(err); }
        if (info != undefined) {
            console.log(info);
            res.status(400).send({msg:"error"});
        } else {
            console.log('user found in db from route');
            res.send(user);
        }
    })(req, res, next);
});


//Google Test
router.get('/google', (req,res,next) => {
    passport.authenticate('google', { scope: ['profile','email'] }, (err, user, info) => {
        if (err) { return next(err); }
        if (info != undefined) {
            console.log(info);
            res.status(400).send(user);
        } else {
            console.log('user found in db from route');
            res.send(user);
        }
    })(req, res, next);
});


//Google Test
router.get('/googletest', passport.authenticate('google'));


//Facebook Test
router.get('/facebook', (req,res,next) => {
    passport.authenticate('facebook',{ scope : ['email'] }, (err, user, info) => {
        if (err) { return next(err); }
        if (info != undefined) {
            console.log(info);
            res.status(400).send(user);
        } else {
            console.log('user found in db from route');
            res.send(user);
        }
    })(req, res, next);
});


//Facebook Test
router.get('/facebooktest', passport.authenticate('facebook'));

module.exports = router;