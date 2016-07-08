var fs = require('fs');
var path = require('path');
var express = require('express');
var mongoose = require('mongoose');
var passport = require('passport');
var bodyParser = require('body-parser');
var session = require('express-session');

var app = express();
require('dotenv').load();
require('./app/config/passport')(passport);

mongoose.connect(process.env.MONGO_URI);

var POSTS_FILE = path.join(__dirname, 'posts.json');

app.set('port', (process.env.PORT || 3000));

app.use('/', express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use(function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    // Disable caching so the blog will always be up-to-date
    res.setHeader('Cache-Control', 'no-cache');
    next();
});

app.use(session({
    secret: 'secretCereblog',
    resave: false,
    saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());

app.get('/auth/github', passport.authenticate('github'));

app.get('/auth/github/callback',
    passport.authenticate('github', { failureRedirect: '/error'}),
    function(req, res) {
        res.redirect('/');
    });

// THIS WILL BE REPLACD BY MONGODB AT SOME POINT
app.get('/api/posts', function(req, res) {
    fs.readFile(POSTS_FILE, function(err, data) {
        if (err) {
            console.error(err);
            process.exit(1);
        }
        res.json(JSON.parse(data));
    });
});

app.post('/api/posts', function(req, res) {
    fs.readFile(POSTS_FILE, function(err, data) {
        if (err) {
            console.error(err);
            process.exit(1);
        }
        var posts = JSON.parse(data);
        // THIS PART WILL BE REPLACED BY MONGO MAGIC
        var newPost = {
            id: Date.now(),
            title: req.body.title,
            author: req.body.author,
            text: req.body.text,
        };
        posts.push(newPost);
        fs.writeFile(POSTS_FILE, JSON.stringify(posts, null, 4), function(err) {
            if (err) {
                console.error(err);
                process.exit(1);
            }
            res.json(posts);
        });
    });
});

app.listen(app.get('port'), function() {
    console.log('Server started: http://localhost:' + app.get('port') + '/');
});