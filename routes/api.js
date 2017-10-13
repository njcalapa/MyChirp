var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Post = mongoose.model('Post');

router.use('/posts', function(req, res, next) {

    if (req.method === "GET") {
        //allow all get request methods
        return next();
    }
    if (req.isAuthenticated()) {
        //user authernticated, continue to the next middleware or request handler
        return next();
    }
    //user not authernticated, redirect to login page
    return res.redirect('/#login');
});

/* GET home page. */
router.route('/posts')

//returns all posts
.get(function(req, res) {

    Post.find(function(err, data) {
        if (err) 
            return res.send(500, err);

        return res.send(data);
    });
})

//creates a new post
.post(function(req, res) {
    var post = new Post();
    post.text = req.body.text;
    post.created_by = req.body.created_by;
    post.save(function(err, post) {
        if (err) 
            return res.send(500, err);

        return res.json(post);
    });
});

router.route('/posts/:id')

//gets specified post
.get(function(req, res) {
    Post.findById(req.params.id, function(err, post) {
        if (err) {
            res.send(err);
        }
        res.json(post);
    });
})

//update specified post
.put(function(req, res) {
    Post.findById(req.params.id, function(err, post) {
        if (err) {
            res.send(err);
        }

        post.created_by = req.body.created_by;
        post.text = req.body.text;

        post.save(function(err, post) {
            if (err) {
                res.send(err);
            }

            res.json(post);
        });
    })
})

//delete existing post
.delete(function(req, res) {
    Post.remove({
        _id: req.params.id
    }, function(err) {
        if (err) {
            res.send(err);
        }
        res.json("deleted : (");
    });
});

module.exports = router;