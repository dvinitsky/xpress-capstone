const express = require('express');
const sqlite3 = require('sqlite3');

const seriesRouter = new express.Router();

module.exports = seriesRouter;

const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

seriesRouter.get('/', (req, res, next) => {
  db.all("SELECT * FROM Series", (error, rows) => {
    if (error) {
      next(error);
    } else {
      res.status(200).send({ series: rows });
    }
  });
});