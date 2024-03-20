const express = require("express");
const mainRouter = require('./routes/index');
const cors = require('cors');

const app = express();  // creates an express application instances

//enabiling cors for any unknown origin
app.use(cors());

app.use(express.json())

app.use('/api/v1', mainRouter);  // middleware is mounted to specified path in this case mainROuter is mounted to /api/vi  -> than means any request coming from starting with /api/vi will be handled by mainROuter

app.listen(3000);


