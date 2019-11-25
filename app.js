var express = require('express');
var fs = require('fs');
var app = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var passport = require('passport');
var LocalStrategy = require('passport-local');
var methodoverride = require('method-override');
var Campground = require('./models/campground');
var Comment = require('./models/comment');
var User = require('./models/user');
const {
    parseString
} = require('xml2js');
const opts = {
    mergeAttrs: true
};
// var seedDB = require("./seeds");

//requiring routes

var commentRoutes = require('./routes/comments');
var campgroundRoutes = require('./routes/campgrounds');
var indexRoutes = require('./routes/index');



mongoose.connect('mongodb://localhost:27017/yelp_camp', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});


seedDB();

app.use(methodoverride('_method'));
app.use(
    bodyParser.urlencoded({
        extended: true
    })
);

app.use(
    require('express-session')({
        secret: 'once again Rusty wins cutest dog!',
        resave: false,
        saveUninitialized: false
    })
);

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.set('view engine', 'ejs');

app.use(function (req, res, next) {
    res.locals.currentUser = req.user;
    next();
});

app.use(indexRoutes);
app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/comments', commentRoutes);

app.listen(3000, function () {
    console.log('yelpcamp server has started');
});

function seedDB() {
    //reading xml file to seed the database
    fs.readFile('./data.xml', function (err, data) {
        var xml = data;
        parseString(xml, opts, function (err, res) {
            //creating data variable which will be used to loop through and store all campgrounds in database
            data = res.campgrounds.campground;
            console.log(JSON.stringify(data));

            //Remove all campgrounds
            Campground.remove({}, function (err) {
                if (err) {
                    console.log(err);
                }
                console.log('removed campgrounds!');
                Comment.remove({}, function (err) {
                    if (err) {
                        console.log(err);
                    }
                    console.log('removed comments!');
                    //add a few campgrounds
                    data.forEach(function (seed) {
                        Campground.create(seed, function (err, campground) {
                            if (err) {
                                console.log(err);
                            } else {
                                console.log('added a campground');
                                //create a comment
                                Comment.create({
                                        text: 'This place is great, but I wish there was internet',
                                        author: 'Homer'
                                    },
                                    function (err, comment) {
                                        if (err) {
                                            console.log(err);
                                        } else {
                                            campground.comments.push(comment);
                                            campground.save();
                                            console.log('Created new comment');
                                        }
                                    }
                                );
                            }
                        });
                    });
                });
            });
        });
    });
}
