var mongoose = require('mongoose');

var campgroundSchema = new mongoose.Schema(
  {
    name: [],
    image: [],
    description: [],
    author: {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      username: String
    },
    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment'
      }
    ]
  },
  {
    versionKey: false
  }
);

module.exports = mongoose.model('Campground', campgroundSchema);
