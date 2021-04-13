'use strict';

const express = require('express');
const router = express.Router();
const superAgent = require('superagent');

const bearerAuth = require('../../auth-server/middleware/bearer.js')
const permissions = require('../../auth-server/middleware/acl.js')

router.get('/', bearerAuth, permissions('create'), handleQuestion);



function handleQuestion(req,res) {
    let url = 'https://opentdb.com/api.php?amount=10&difficulty=easy&type=boolean';

    superAgent.get(url).then(data => {
        //  console.log(data.body.results);

        let newData = data.body.results.map(data => new Question(data));
        // console.log(newData);
        res.render('game', { data: newData });
    });
    
}

function Question(data) {
    this.question = data.question;
    this.correct_answer = data.correct_answer;
    this.incorrect_answers = data.incorrect_answers;
}

module.exports = router;