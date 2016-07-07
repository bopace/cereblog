var fs = require('fs');
var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');
var app = express();

// TODO: Add MongoDB for storing posts and comments
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