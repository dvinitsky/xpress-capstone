const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const apiRouter = require('./api/api');
const errorhandler = require('errorhandler');

const PORT = process.env.PORT || 4000;

app.use(bodyParser.json());
app.use(cors());
app.use(errorhandler());

app.use('/api', apiRouter);

module.exports = app;


app.listen(PORT, () => {
  console.log('Connected on port ' + PORT);
});