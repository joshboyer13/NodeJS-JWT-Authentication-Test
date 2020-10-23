const express = require('express');
const app = express();

const jwt = require('jsonwebtoken');

const exjwt = require('express-jwt');
const bodyParser = require('body-parser');
const path = require('path');
const { settings } = require('cluster');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true}));
app.use((req, res, next) => { 
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.setHeader('Access-Control-Allow-Headers', 'Content-type, Authorization');
    next();
});

const port = 3000;

const secretKey = "My super secret key";
const jwtMW = exjwt({
    secret: secretKey,
    algorithms: ['HS256']

});

let users = [
    {
        id: 1,
        username: 'Josh',
        password: '123'
    },
    {
        id: 2,
        username: 'Boyer',
        password: '456'
    }

];

app.get('/',( req, res) => {

    res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/api/login',( req, res) => {
    const {username, password} = req.body;

    for( let user of users){
        if (username == user.username && password == user.password){
            let token = jwt.sign({ id: user.id, username: user.username }, secretKey, { expiresIn: '7d'});
            res.json({
                success: true,
                err: null, 
                token
            });
            break;
        }
        else {
            res.status(401).json({
                success: false,
                token: null,
                err: 'Username or password is incorrect'
            });
        }
    }
    
});

app.get('/api/dashboard',jwtMW, (req, res) => {
    res.json({
        success: true,
        title: 'Settings',
        myContent: 'Secret Content that only logged on people can see!!!!'
    });
});

app.get('/api/settings',jwtMW, (req, res) => {
    res.json({
        success: true,
        title: 'Settings',
        myContent: 'Settings Page'
    });
});

app.use(function (err, req, res, next){
    console.log(err.name === 'UnauthorizedError');
    console.log(err);
    if (err.name === 'UnauthorizedError'){
        res.status(401).json({
            success: false,
            officialError: err,
            err: 'Username or password is incorrect 2(No token)'
        });
    }
    else{
        next(err);
    }
});

app.listen(port, () =>{

    console.log('Example app listening at ')

});




