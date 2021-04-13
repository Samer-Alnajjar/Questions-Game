'use strict';

const mongoose = require('mongoose');
// const bcrypt = require('bcrypt');
// const jwt = require('jsonwebtoken');

const usersSchema = mongoose.Schema({
    username: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, required: true, default: 'user', enum: ['user', 'admin'] },
    points: { type: String, required: true },
});

const users = mongoose.model('clothes', usersSchema);

module.exports = users;