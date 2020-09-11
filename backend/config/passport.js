const LocalStrategy = require('passport-local').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const keys = require('./keys');
const bcrypt = require('bcryptjs');

//Load user model
const User = require('../models/User');

module.exports = (passport) => {
    passport.use('local-login',
        new LocalStrategy(
            {
                usernameField: 'email',
                session: false
            },(email,password,done) => {
            //Match user
            User.findOne({email})
                .then(user => {
                    if(!user){
                        return done(null, false, { message: 'Incorrect username'})
                    }

                    //Match password
                    bcrypt.compare(password, user.password,(err, isMatch) => {
                        if(err) throw err;
                        if(isMatch){
                            return done(null, user)
                        } else {
                            return done(null, false, {message: 'Incorrect password'})
                        }

                    });
                })
                .catch(err => console.log(err))
        })
    );

    passport.use('jwt',
        new JwtStrategy(
            {
                jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('JWT'),
                secretOrKey: keys.jwt.secret
            }, (jwt_payload, done) => {
                User.findOne({email:jwt_payload.id})
                    .then((user) => {
                        if(!user){
                            done(null, false, { message: 'Incorrect username'})
                        } else {
                            done(null,user)
                        }
                    })
                    .catch(err => console.log(err))
            }
        )
    );

    passport.use('google',
        new GoogleStrategy(
            {
                clientID: keys.google.id,
                clientSecret: keys.google.secret,
                callbackURL: 'http://localhost:8000/api/users/googletest'
            }, (accessToken, refreshToken, profile, done) => {
                User.findOne({'logintype.id':profile.id, 'logintype.type':'google'})
                    .then((user) => {
                        if(user){
                            return done(null, user)
                        } else {
                            new User({
                                name: profile.displayName.replace(/^(.)|\s+(.)/g, function ($1) {
                                    return $1.toUpperCase()
                                }),
                                email: profile.emails[0].value,
                                logintype: {
                                    type: 'google',
                                    id: profile.id,
                                    photos: profile.photos
                                }
                            }).save()
                                .then((user) => {
                                    done(null,user);
                                })
                        }
                    })
                    .catch(err => console.log(err));
            }
        )
    );

    passport.use('facebook',
        new FacebookStrategy({
            clientID: keys.facebook.id,
            clientSecret: keys.facebook.secret,
            callbackURL: 'http://localhost:8000/api/users/facebooktest',
            profileFields: ['id', 'emails', 'name']
        }, (accessToken, refreshToken, profile,done) => {
            User.findOne({'logintype.id':profile.id, 'logintype.type':'facebook'})
                .then((user) => {
                    if(user){
                        return done(null, user)
                    } else {
                        new User({
                            name: profile.name.givenName + ' ' + profile.name.middleName + ' '+ profile.name.familyName,
                            email: profile.emails[0].value,
                            logintype: {
                                type: 'facebook',
                                id: profile.id,
                            }
                        }).save()
                            .then((user) => {
                                done(null,user);
                            })
                    }
                })
                .catch(err => console.log(err));
        })
    );

    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser((id, done) => {
        User.findById(id, (err, user) => {
            done(err, user);
        });
    });

}