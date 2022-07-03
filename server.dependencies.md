<!--//List of npm dependencies -->

npm init -y // creates package.json
npm i express // Install's express middleware

<!-- ! Add this after the installation of express -->

"main": "index.js",
"type": "module",

npm install --save-dev nodemon // install's the nodemon in dev dependencies

<!--! Add this in scripts after the installation of nodemon  -->

"scripts": {
"start": "node index.js",
"dev":"nodemon index.js",

npm i mongodb // Node. js's package manager, is the bridge that allows the MongoDB Node. js driver to be installed

<!--$ MongoDB Function  -->

async function createConnection() {
const client = new MongoClient(MONGO_URL);
await client.connect();
console.log("Mongo is connected ✌️😊");
return client;
}
npm install // install's node_modules
create .gitigniore
create .env
npm i dotenv
npm i cors
npm i bcrypt
MONGO_URL = "mongodb://127.0.0.1"

<!--// Heroku CLI Deployment Guide -->

initially we have to install Heroku CLI software

create proc file => write: web: node index.js

In terminal ENTER => heroku login => then conform in login page.

In terminal ENTER => git init

In terminal ENTER => heroku create UniqueName

In terminal ENTER => git add .

In terminal ENTER => git commit -m "first commit"

In terminal ENTER => git push heroku master

In heroku go to config Vars in settings => paste MONGO_url : mongodb+srv://gowtham:<password98745412>@cluster0.oyjmb.mongodb.net

In terminal ENTER => heroku restart

In terminal ENTER => heroku open

******\_\_\_******Completed************\_************
