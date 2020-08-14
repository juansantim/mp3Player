const express = require('express');

const md5 = require('md5');

const jwt = require("jsonwebtoken");

const model = require('../Model/model');

const router = express.Router();

const { Op } = require('sequelize');

let TOKEN_SECRET = 'F3JQsylsQsrG5UPzz2zcUg==';
  
router.post('/login', (req, res) => {

    const { user } = req.body;
    var password = md5(user.Password);

    model.Usuarios.findOne({
        where: {
            [Op.or]: [
                { UserName: user.UserName },
                { Email: user.UserName }
            ],
            Password: { [Op.eq]: password }
        },
        attributes: ['id', 'UserName', 'Email', 'FirstName', 'LastName']
    }).then(usr => {
        if(usr){
            res.send(generateAccessToken(usr.dataValues));
        }
        else{
            res.sendStatus(401);
        }
    }).catch(err => {
        res.sendStatus(500);
    })

});

function generateAccessToken(payload) {
    // expires after half and hour (1800 seconds = 30 minutes)
    //return jwt.sign(username, process.env.TOKEN_SECRET, { expiresIn: '1800s' });
    return jwt.sign(payload, TOKEN_SECRET, { expiresIn: '1800s' });
}



module.exports = router;