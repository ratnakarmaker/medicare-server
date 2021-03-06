const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const bodyParser = require("body-parser");
const fileupload = require("express-fileupload");
const MongoClient = require("mongodb").MongoClient;
const ObjectId = require("mongodb").ObjectID;

const port = 5000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static("doctors"));
app.use(fileupload());

app.get("/", (req, res) => {
  res.send("Welcome Backhand");
});

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.vdydn.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

client.connect((err) => {
  const courseCollection = client.db(`${process.env.DB_NAME}`).collection("departments");
  const serviceCollection = client.db(`${process.env.DB_NAME}`).collection("service");
  const reviewCollection = client.db(`${process.env.DB_NAME}`).collection("review");
  const adminCollection = client.db(`${process.env.DB_NAME}`).collection("admin");
  const orderCollection = client.db(`${process.env.DB_NAME}`).collection("order");
  console.log("Database is connected");

  // course post
  app.post("/selectedCourse", (req, res) => {
    const service = req.body.data.service;
    const description = req.body.data.description;
    const image = req.body.data.image;
    const email = req.body.data.email;
    const name = req.body.data.name;
    const photo = req.body.data.img;
    const isSignIn = req.body.data.isSignIn;

    courseCollection
      .insertOne({ service, description, image, email, name, photo, isSignIn })
      .then((result) => {
        res.send(result.insertedCount > 0);
      });
  });

  // course get
  app.get("/course", (req, res) => {
    courseCollection.find({ email: req.query.email }).toArray((err, doc) => {
      res.send(doc);
    });
  });

  app.get("/allCourse", (req, res) => {
    courseCollection.find({}).toArray((err, doc) => {
      res.send(doc);
    });
  });
  // service post
  app.post("/addService", (req, res) => {
    const file = req.files.file;
    const service = req.body.service;
    const description = req.body.description;
    const newImg = file.data;
    const encImg = newImg.toString("base64");

    const image = {
      contentType: req.files.file.mimetype,
      size: req.files.file.size,
      img: Buffer.from(encImg, "base64"),
    };

    serviceCollection
      .insertOne({ service, description, image })
      .then((result) => {
        res.send(result.insertedCount > 0);
      });
  });

  //service get
  app.get("/service", (req, res) => {
    serviceCollection.find({}).toArray((err, doc) => {
      res.send(doc);
    });
  });

  // review post
  app.post("/review", (req, res) => {
    const review = req.body.review;

    reviewCollection.insertOne(review).then((result) => {
      res.send(result.insertedCount > 0);
    });
  });
  // review get
  app.get("/allReview", (req, res) => {
    reviewCollection.find({}).toArray((err, doc) => {
      res.send(doc);
    });
  });

  // admin post
  app.post("/addAdmin", (req, res) => {
    const email = req.body.data;

    adminCollection.insertOne({ email: email }).then((result) => {
      res.send(result.insertedCount > 0);
    });
  });
  // Is Admin post
  app.post("/isAdmin", (req, res) => {
    const email = req.body.data;
    adminCollection.find({ email: email }).toArray((err, admin) => {
      res.send(admin.length > 0);
    });
  });

  // admin get
  app.get("/Admin", (req, res) => {
    console.log(req.body.email);
    adminCollection.find({}).toArray((err, doc) => {
      res.send(doc);
    });
  });

  //delete

  app.delete("/delete/:id", (req, res) => {
    courseCollection
      .deleteOne({ _id: ObjectId(req.params.id) })
      .then((result) => {
        res.send(result.insertedCount > 0);
      });
  });
});

app.listen(process.env.PORT || port)
