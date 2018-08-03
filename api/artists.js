const express = require('express');
const sqlite3 = require('sqlite3');

const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

const artistsRouter = new express.Router();

artistsRouter.get('/', (req, res, next) => {
  db.all("SELECT * FROM Artist WHERE Artist.is_currently_employed = 1", (error, rows) => {
    if (error) {
      next(error);
    } else {
      res.status(200).send({ artists: rows });
    }
  });
});

artistsRouter.get('/:artistId', (req, res, next) => {
  db.get("SELECT * FROM Artist WHERE $artistId = id", { $artistId: req.params.artistId }, (err, row) => {
    if (err) {
      next(err)
    } else {
      if (row) {
        res.status(200).send({ artist: row });
        next();
      } else {
        res.status(404).send();
        next();
      }
    }
  });
});

artistsRouter.post('/', (req, res, next) => {
  const artist = req.body.artist;
  if (!artist.name || !artist.dateOfBirth || !artist.biography) {
    res.status(400).send();
    next();
  } else if (artist.isCurrentlyEmployed === undefined) {
    artist.isCurrentlyEmployed = 1;
  }

  db.run("INSERT INTO Artist (name, date_of_birth, biography, is_currently_employed) VALUES ($name, $dateOfBirth, $biography, $isCurrentlyEmployed)", { $name: artist.name, $dateOfBirth: artist.dateOfBirth, $biography: artist.biography, $isCurrentlyEmployed: artist.isCurrentlyEmployed }, (err) => {
    if (err) {
      next(err);
    }
  }, function () {
    db.get("SELECT * FROM Artist WHERE id = $lastID", { $lastID: this.lastID }, (err, row) => {
      res.status(201).send({ artist: row });
    });
  });

});

artistsRouter.put('/:artistId', (req, res, next) => {
  const artist = req.body.artist;

  if (!artist.name || !artist.dateOfBirth || !artist.biography || artist.isCurrentlyEmployed === undefined) {
    res.status(400).send();
    return;
  }

  db.serialize(() => {
    db.run("UPDATE Artist SET name = $name, date_of_birth = $dateOfBirth, biography = $biography, is_currently_employed = $isCurrentlyEmployed WHERE id = $id", { $name: artist.name, $dateOfBirth: artist.dateOfBirth, $biography: artist.biography, $isCurrentlyEmployed: artist.isCurrentlyEmployed, $id: req.params.artistId }, (err) => {
      if (err) {
        next(err);
        return;
      }
    });

    db.get("SELECT * FROM Artist WHERE id = " + req.params.artistId, (err, row) => {
      if (err) {
        next(err);
      } else {
        res.status(200).json({ artist: row });
      }
    });

  });
});

/*
artistsRouter.delete('/:artistId', (req, res, next) => {
  db.run("UPDATE Artist SET is_currently_employed = 0 WHERE id = " + req.params.artistId, (err) => {
    if (err) {
      next(err);
    } else {
      db.get("SELECT * FROM Artist WHERE id = " + req.params.artistId, (err, row) => {
        if (err) {
          next(err);
        } else {
          res.status(200).send({ artist: row });
        }
      });
    }
  });
});
*/

module.exports = artistsRouter;