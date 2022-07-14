import express, { response, text } from "express";
import { MongoClient, ObjectId } from "mongodb";
// import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";
import { request } from "http";
import jsonwebtocken from "jsonwebtoken";
import { verify } from "crypto";
import cors from 'cors'
// const cors = require("cors"); 

const app = express();

dotenv.config();
 app.use( cors({ origin: "*", }) );
  app.use(express.json());


// dotenv.config();



const PORT = process.env.PORT||5000;

const MONGO_URL = process.env.MONGO_URL;

//? Express Inbuild MiddleWare

// app.use(express.json());

// ? CORS Third party middleware

// app.use(cors());

const client = await createConnection();

app.get("/", (request, response) => {
  response.send("Welcome to App");
});

// ?  SIGNUP DETAILS

app.post( "/form/signUp",async (request, response) => {
    const { firstname, secondname, email, contact, password } = request.body;

    // !  PASSWORD HASHING PROCESS
    const hashPassword = await createPassword(password);

    const newUser = {
      name: firstname + " " + secondname,
      email: email,
      contact: contact,
      password: hashPassword,
    };

    const checkExisting = await client
      .db("signUp")
      .collection("user")
      .findOne({email:newUser.email});

    if (!checkExisting) {
      const signUp = await client
      .db("signUp")
      .collection("user")
      .insertOne(newUser);

    if (!signUp) {
      response.status(404).send("Error");
    }else{
      response.send(signUp);
    }
    } else {
    response.status(409).send({ error: "Account already exists" });
    }
  }
  
  // ! CREATING A SIGNUP DATA ON DATABASE
);

// ? LOGIN VERIFICATION

app.post("/form/signIn", async (request, response) => {
  const { email, password, _id } = request.body;

  const signIn = await client
    .db("signUp")
    .collection("user")
    .findOne({ email: email });

  if (!signIn) {
    response.status(401).send("Invalid Credentials");
  } else {
    const storedPassword = signIn.password;
    const isPasswordMatch = await bcrypt.compare(password, storedPassword);
    if (!isPasswordMatch) {
      response.status(401).send("Invalid credentials");
    } else {
      const token = jsonwebtocken.sign(
        {
          id: signIn._id,
        },
        process.env.privateKey1
      );

      response.send({ message: `Welcome ${signIn.name}`,token });

    }
  }
});

var sender = nodemailer.createTransport({
  service: "gmail", // Gmail service
  // Authentication
  auth: {
    user: process.env.secondaryMail, // Email
    pass: process.env.secondaryPass, // Password
  },
});

app.post("/form/addRandomString", async (request, response) => {
  
  const data = request.body;

  const { name, email } = request.body;

  let token = await jsonwebtocken.sign(
    {
      data: data
    },
    process.env.privateKey,
    { expiresIn: "24hours" }
  );

  // ? Here we check wheather the mentioned email-id in forgot-password page available in DB or Not.

  // ? If email exists in DB we send mail to the existing mail-id.

  const checkAvailablity = await client
    .db("signUp")
    .collection("user")
    .findOne(data);
    
  const BSON_id = await checkAvailablity._id;

  console.log(BSON_id);

  if (!checkAvailablity) {
    response.status(404).send("User doesn't exist");
  } else {
    // ?  Node Mailer
    var composemail = {
      from: process.env.secondaryMail, // Sender address
      to: email,
      subject: "Password verification",
      text: `${process.env.Base_URL}/${BSON_id}/${token}`,
    };

    sender.sendMail(composemail, function (error, info) {
      if (error) {
        response.status(404).send("server busy");
      } else {
        console.log("success" + info.response);

        response.send({
          to: email,
          subject: subject,
          message:
            "Please Click the link below to reset the passsword for security reasons the link will be expired in the next 10 minute",
        });
      }
    });
  }
});

app.post("/reset-password/:_id/:token", async (request, response) => {
  const { _id } = request.params;

  const token = request.header("token");

  const { password, newPassword } = request.body;

  const conformId = await client
    .db("signUp")
    .collection("user")
    .findOne({ _id: ObjectId(`${_id}`) });

  if (!conformId) {
    response.status(404).send("not found");
  } else {
    const verify = jsonwebtocken.verify(token, process.env.privateKey);
    console.log(verify.data.email);
    if (verify.data.email !== conformId.email) {
      response.status(404).send("Token not Matched");
    } else {
      if (password == newPassword) {
        const updatedHashPassword = await createPassword(password);

        const updatePassword = await client
          .db("signUp")
          .collection("user")
          .updateOne(
            { _id: ObjectId(`${_id}`) },
            { $set: { password: updatedHashPassword } }
          );

        response.send("Password updated Successfully");
      }
    }
  }
});

app.post("/check", async (request, response) => {
  const email = request.body;

  const check = await client.db("signUp").collection("user").findOne(email);

  response.send(check);
});

app.listen(PORT, () => console.log(`Server connected to the ${PORT}`));

//! ____________________________________________________________Functions________________________________________________

// ? DataBase Connection

async function createConnection() {
  const client = new MongoClient(MONGO_URL);

  await client.connect();

  console.log("MongoDb is connected to server 👍🏽");

  return client;
}

// ?  Hashing and salting process before storing a password in DB

async function createPassword(password) {
  const salt = await bcrypt.genSalt(10); // Addition of some random string
  const hash = await bcrypt.hash(password, salt);
  console.log(hash);
  return hash;
}
