const { urlencoded } = require("express");
const express = require("express");
const mongoose = require("mongoose");
const keys = require('./config/keys');

const app = express();

//Set view engine
app.set("view engine", "ejs");

// Use body-parser
app.use(express.urlencoded({ extended: true }));

// Use Pubic directory
app.use(express.static("public"));


//Connect mongoose to mongodb
mongoose.connect(keys.remoteDB, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
});

// Create mongoose schema
const postSchema = mongoose.Schema({
  title: {
    type: String,
    // required: true,
  },
  imgUrl: {
    type: String,
    default:
      "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60",
  },
  content: {
    type: String,
    // required: true,
  },
  featured: {
    type: Boolean,
    default: false,
  },
  date: {
    type: Date,
    default: Date.now(),
  },
});

//Create mongoose model
const Post = mongoose.model("Post", postSchema);

// Routes
app.get("/", (req, res) => {
  Post.find({})
    .then((posts) => res.render("home", { posts: posts }))
    .catch((err) => console.log(err));
});


app.get("/create-post", (req, res) => {
  res.render("create-post");
});
app.get("/post/:id", (req, res) => {
  Post.findOne({ _id: req.params.id })
    .then((post) => {
      Post.find({}).then((allPosts) => {
        let readNext = {};
        if (allPosts.length > 1) {
          
          readNext = allPosts.reverse()[0];
        
          if (String(readNext._id) === String(post._id)) {
            if(allPosts.length > 2){
            readNext = allPosts.reverse()[1];
            }else{
            readNext = allPosts.reverse()[0];
            }


            
          }
        }

        res.render("single-post", { post: post, readNext: readNext });
      });
    })
    .catch((err) => console.log(err));
});

//All Posts for admin
app.get("/allPosts", (req, res) => {
  Post.find({})
    .then((posts) => res.render("allPosts", { posts: posts }))
    .catch((err) => console.log(err));
});

//Edit single post by admin
app.get("/edit/:id", (req, res) => {
  Post.findOne({ _id: req.params.id })
    .then((post) => {
      res.render("edit-post", { post: post });
    })
    .catch((err) => console.log(err));
});

// POST ROUTES
app.post("/create-post", (req, res) => {
  const newPost = new Post({
    title: req.body.title,
    imgUrl: req.body.imgUrl,
    content: req.body.content,
    featured: req.body.featured === "on" ? true : false,
  });

  newPost.save().catch((err) => console.log(err));

  res.redirect("/");
});

app.post("/edit-post", (req, res) => {
  const latestPost = {
    title: req.body.title,
    imgUrl: req.body.imgUrl,
    content: req.body.content,
    featured: req.body.featured === "on" ? true : false,
  };

  if (req.body.btn === "btn-update") {
    // Find and update post
    Post.findOneAndUpdate({ _id: req.body._id }, latestPost).catch((err) =>
      console.log(err)
    );
  } else if (req.body.btn === "btn-delete") {
    Post.findOneAndDelete({ _id: req.body._id }).catch((err) =>
      console.log(err)
    );
  }
  res.redirect("/allPosts");
});

app.get("*", (req, res) => {
  res.render("404");
});

// PORT
const PORT = process.env.PORT || 5000;
app.listen(PORT, (err) => {
  if (err) {
    console.log(err);
  } else {
    console.log("App Started in Port 5000");
  }
});
