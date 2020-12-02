const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const MongoClient = require('mongodb').MongoClient;
const fileUpload = require('express-fileupload');
const fs = require('fs-extra');
const objectID = require('mongodb').ObjectID;
var Binary = require('mongodb').Binary;

require('dotenv').config()

const port = 5000;


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.zkovl.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());
app.use(fileUpload());


client.connect(err => {
  const businessInfoCollection = client.db("doctorPortal").collection("businessInfo");
  const servicesCollection = client.db("doctorPortal").collection("services");
  const testimonialCollection = client.db("doctorPortal").collection("testimonial");
  const blogsCollection = client.db("doctorPortal").collection("blogs");
  const doctorsCollection = client.db("doctorPortal").collection("doctors");
  const appointmentsCollection = client.db("doctorPortal").collection("appointments");
  const dashboardCollection = client.db("doctorPortal").collection("dashboard");
  const adminsCollection = client.db("doctorPortal").collection("admins");
  const doctorsEmailCollection = client.db("doctorPortal").collection("doctorsEmail");

  const bookedAppointmentsCollection = client.db("doctorPortal").collection("bookedAppointments")


  app.get('/businessInfo', (req, res) => {
    businessInfoCollection.find({})
      .toArray((err, documents) => {
        res.send(documents);
      })
  })

  app.get('/services', (req, res) => {
    servicesCollection.find({})
      .toArray((err, documents) => {
        res.send(documents);
      })
  })

  app.get('/testimonials', (req, res) => {
    testimonialCollection.find({})
      .toArray((err, documents) => {
        res.send(documents);
      })
  })

  app.get('/blogs', (req, res) => {
    blogsCollection.find({})
      .toArray((err, documents) => {
        res.send(documents);
      })
  })

  app.get('/doctors', (req, res) => {
    doctorsCollection.find({})
      .toArray((err, documents) => {
        res.send(documents);
      })
  })

  app.get('/specialistDoctor/:specialistOn', (req, res) => {
    doctorsCollection.find({ specialistOn: req.params.specialistOn })
      .toArray((err, documents) => {
        res.send(documents);
      })
  })

  app.post('/addDoctor', (req, res) => {
    const file = req.files.file;
    const name = req.body.name;
    const email = req.body.email;
    const specialistOn = req.body.specialistOn;
    const phone = req.body.phone;
    const newFile = file.data;
    const encFile = newFile.toString('base64')

    const image = {
      contentType: file.mimetype,
      size: file.size,
      img: Buffer.from(encFile, 'base64')
    };

    const doctorInfo = { name: name, email: email, specialistOn: specialistOn, phone: phone, image: image }

    doctorsCollection.insertOne(doctorInfo)
      .then(result => {

      })
  })

  app.post('/addDoctorEmail', (req, res) => {
    doctorsEmailCollection.insertOne(req.body)
      .then(result => {

      })
  })

  app.delete('/removeDoctor/:email', (req, res) => {
    doctorsCollection.deleteOne({ email: req.params.email })
      .then((err, result) => {

      })
  })

  app.delete('/removeDoctorEmail/:email', (req, res) => {
    doctorsEmailCollection.deleteOne({ email: req.params.email })
      .then((err, result) => {

      })
  })

  app.get('/appointments', (req, res) => {
    appointmentsCollection.find({})
      .toArray((err, documents) => {
        res.send(documents);
      })
  })

  app.get('/dashboard', (req, res) => {
    dashboardCollection.find({})
      .toArray((err, documents) => {
        res.send(documents);
      })
  })

  app.post('/bookAnAppointment', (req, res) => {
    const appointment = req.body;
    bookedAppointmentsCollection.insertOne(appointment)
      .then(result => {

      })
  })

  app.get('/allBookedAppointments', (req, res) => {
    bookedAppointmentsCollection.find({})
      .toArray((err, documents) => {
        res.send(documents);
      })
  })

  app.get('/singleDoctorAppointment/:email', (req, res) => {
    bookedAppointmentsCollection.find({ "appointmentWith.doctorEmail": req.params.email })
      .toArray((err, documents) => {
        res.send(documents);
      })
  })

  app.get('/userAppointments/:email', (req, res) => {
    bookedAppointmentsCollection.find({ email: req.params.email })
      .toArray((err, documents) => {
        res.send(documents);
      })
  })

  app.get('/singleDateAppointments', (req, res) => {
    const date = new Date().toDateString().slice(4);
    bookedAppointmentsCollection.find({ date: date })
      .toArray((err, documents) => {
        res.send(documents);
      })
  })

  app.get('/oneWeeksAppointments/:week', (req, res) => {

    const getWeekDates = (start, end) => {
      for (var arr = [], dt = new Date(start); dt <= end; dt.setDate(dt.getDate() + 1)) {
        arr.push(new Date(dt).toLocaleDateString());
      }
      return arr;
    };

    const today = new Date().getDay();
    const weekYear = req.params.week.split('-W');

    const day = new Date("Jan 01, " + weekYear[0] + " 01:00:00");
    const week = day.getTime() - (3600000 * 24 * (today - 1)) + 604800000 * (weekYear[1] - 1)
    const firstDay = new Date(week);
    const lastDay = new Date(week + 518400000)

    const dates = getWeekDates(new Date(firstDay), new Date(lastDay))

    bookedAppointmentsCollection.find({ date: { $in: [...dates] } })
      .toArray((err, documents) => {
        res.send(documents);
      })
  })

  app.get('/singleDoctorOneWeeksAppointments/:email/:week', (req, res) => {

    const getWeekDates = (start, end) => {
      for (var arr = [], dt = new Date(start); dt <= end; dt.setDate(dt.getDate() + 1)) {
        arr.push(new Date(dt).toLocaleDateString());
      }
      return arr;
    };

    const today = new Date().getDay();
    const weekYear = req.params.week.split('-W');

    const day = new Date("Jan 01, " + weekYear[0] + " 01:00:00");
    const week = day.getTime() - (3600000 * 24 * (today - 1)) + 604800000 * (weekYear[1] - 1)
    const firstDay = new Date(week);
    const lastDay = new Date(week + 518400000)

    const dates = getWeekDates(new Date(firstDay), new Date(lastDay))

    bookedAppointmentsCollection.find({
      "appointmentWith.doctorEmail": req.params.email, 
      date: { $in: [...dates] }
    })
      .toArray((err, documents) => {
        res.send(documents);
      })
  })

  app.patch('/addPrescription/:id', (req, res) => {
    const file = req.files.file;
    const newFile = file.data;
    const encFile = newFile.toString('base64')

    const prescription = {
      contentType: file.mimetype,
      size: file.size,
      doc: Buffer.from(encFile, 'base64')
    };

    bookedAppointmentsCollection.updateOne({ _id: objectID(req.params.id) },
      {
        $set: { prescription: prescription }
      })
      .then(result => {

      })
  })

  app.patch('/updateStatus/:id', (req, res) => {
    const status = req.body.status;
    const bg = req.body.bg;
    const color = req.body.color;

    bookedAppointmentsCollection.updateOne({ _id: objectID(req.params.id) },
      {
        $set: { status: status, bg: bg, color: color }
      })
      .then(result => {

      })
  })

  app.get('/admins', (req, res) => {
    adminsCollection.find({})
      .toArray((err, documents) => {
        res.send(documents);
      })
  })

  app.post('/addAdmin', (req, res) => {
    adminsCollection.insertOne(req.body)
      .then(result => {

      })
  })

  app.delete('/removeAdmin/:email', (req, res) => {
    adminsCollection.deleteOne({ email: req.params.email })
      .then((err, result) => {

      })
  })

  app.get('/doctorsEmail', (req, res) => {
    doctorsEmailCollection.find({})
      .toArray((err, documents) => {
        res.send(documents);
      })
  })


  console.log("Database connected");
});



app.listen(process.env.PORT || port);