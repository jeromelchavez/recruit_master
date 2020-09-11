const mongoose = require('mongoose');

const LoginType = new mongoose.Schema({
    type: {
        type: String,
        enum: ['local','facebook','google'],
        default: 'local',
        index: true,
        required: true
    },
    id: Number,
    photos: Array
});

const UserSchema = new mongoose.Schema({

    logintype: LoginType,
    name:{
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true
    },
    password:{
        type: String,
        required: false
    },
    createdAt:{
        type: Date,
        default: Date.now
    }
})

const User = mongoose.model('User', UserSchema);

module.exports = User;