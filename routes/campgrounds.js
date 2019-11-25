var express = require('express');
var router = express.Router();
var Campground = require('../models/campground');
var Comment = require('../models/comment');

router.get('/', function(req, res) {
  Campground.find({}, function(err, allCampgrounds) {
    if (err) {
      console.log(err);
    } else {
      res.render('campgrounds/index', {
        campgrounds: allCampgrounds
      });
    }
  });
});

router.post('/', isLoggedin, function(req, res) {
  //get data from form and add to campgrounds array
  var name = req.body.name;
  var image = req.body.image;
  var desc = req.body.description;
  var author = {
    id: req.user._id,
    username: req.user.username
  };
  var newcampground = {
    name: name,
    image: image,
    description: desc,
    author: author
  };
  Campground.create(newcampground, function(err, newlycreated) {
    if (err) {
      console.log(err);
    } else {
      res.redirect('/campgrounds');
      //redirect back to campgrounds page
    }
  });
});

router.get('/new', isLoggedin, function(req, res) {
  res.render('campgrounds/new');
});

router.get('/:id', function(req, res) {
  //find the campground with provided id
  Campground.findById(req.params.id)
    .populate('comments')
    .exec(function(err, foundCampground) {
      if (err) {
        console.log(err);
      } else {
        res.render('campgrounds/show', {
          campground: foundCampground
        });
      }
    });
});
//edit camoground route
router.get('/:id/edit', checkCampgroundOwnership, function(req, res) {
  //is user logged in
  Campground.findById(req.params.id, function(err, foundCampground) {
    res.render('campgrounds/edit', {
      campground: foundCampground
    });
  });
});

//update campground route
router.put('/:id', checkCampgroundOwnership, function(req, res) {
  //find and update the correct campground
  Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(
    err,
    updatedCampground
  ) {
    if (err) {
      res.redirect('/campgrounds');
    } else {
      res.redirect('/campgrounds/' + req.params.id);
    }
  });
});

//delete route
router.delete('/:id', checkCampgroundOwnership, function(req, res) {
  Campground.findByIdAndRemove(req.params.id, function(err) {
    if (err) {
      res.redirect('/campgrounds');
    } else {
      res.redirect('/campgrounds');
    }
  });
});

function isLoggedin(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
}

function checkCampgroundOwnership(req, res, next) {
  if (req.isAuthenticated()) {
    Campground.findById(req.params.id, function(err, foundCampground) {
      if (err) {
        res.redirect('back');
      } else {
        //does user own the campground
        if (foundCampground.author.id.equals(req.user._id)) {
          next();
        } else {
          res.redirect('back');
        }
      }
    });
  } else {
    res.redirect('back');
  }
}

module.exports = router;
