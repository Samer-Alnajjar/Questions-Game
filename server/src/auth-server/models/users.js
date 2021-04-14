'use strict';

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const usersSchema = mongoose.Schema({
    username: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, required: true, default: 'user', enum: ['user', 'admin'] },
    points: { type: String, required: true },
});


usersSchema.virtual('token').get(function () {
    let tokenObject = {
        username: this.username,
    }
    return jwt.sign(tokenObject, process.env.SECRET)
});

usersSchema.virtual('capabilities').get(function () {
    let acl = {
        user: ['read'],
        // editor: ['read', 'create', 'update'],
        admin: ['read', 'create', 'update', 'delete']
    };
    return acl[this.role];
});

usersSchema.pre('save', async function () {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10);
    }
});

// BASIC AUTH
usersSchema.statics.authenticateBasic = async function (username, password) {
    const user = await this.findOne({ username })
    const valid = await bcrypt.compare(password, user.password)
    if (valid) { return user; }
    throw new Error('Invalid User');
}

// BEARER AUTH
usersSchema.statics.authenticateWithToken = async function (token) {
    try {
        const parsedToken = jwt.verify(token, process.env.SECRET);
        const user = this.findOne({ username: parsedToken.username })
        if (user) { return user; }
        throw new Error("User Not Found");
    } catch (e) {
        throw new Error(e.message)
    }
}


module.exports = mongoose.model('users', usersSchema);

