const auth = require(__dirname + '/static/auth');
const express = require('express');
const mongoose = require('mongoose');

const app = express();

const HOST = 'http://localhost';
const PORT = '8080';
const SERVER = HOST + ':' + PORT + '/';

const database = 'mongodb+srv://' + auth.mongoUser +':' + auth.mongoPass +'@wikis.dciy0.mongodb.net/wikis'
const mongoContext = {
  useNewUrlParser: true,
  useUnifiedTopology: true
};

mongoose.connect(database, mongoContext, function(err) {
  if (err) { 
    console.error('Failed to connect to database! Exiting server...');
    console.error(err);
    process.exit(1);
  } else {
    console.log('Successfully connected to database!');
  }
});

const noteSchema = new mongoose.Schema({ title: String, content: String });
const sectionSchema = new mongoose.Schema({ title: String, notes: [noteSchema] });
const wikiSchema = new mongoose.Schema({ title: String, sections: [sectionSchema] });

const noteModel = mongoose.model("Note", noteSchema);
const sectionModel = mongoose.model("Section", sectionSchema);
const wikiModel = mongoose.model("Wiki", wikiSchema);

app.get('/', function(req, res) {
  res.write('\nWelcome to WiKi!\n');
  wikiModel.find({}, function(err, wikis) {
    if (err) {
      res.write('\nAn unkown error has occured');
      console.error(err);
    } else if (wikis.length === 0) {
      res.write('\n[ No wikis to show ]')
    } else {
      res.write('\nWikis:');
      wikis.forEach(function(wiki) {
        res.write('\n\t'+wiki.title);
      });
    }

    res.send();
  })
});

app.delete('/', function(req, res) {
  wikiModel.deleteMany({}, function(err) {
    if (err) {
      res.write('\nAn unkown error has occured');
      console.error(err);
    } else {
      res.write('\nDeleted all wikis');
    }

    res.send();
  }) 
})

/* WIKIS */
app.get('/:wikiTitle', function(req, res) {
  wikiModel.findOne({ title: req.params.wikiTitle }, function(err, wiki) {
    if (err) {
      res.write('\nAn unkown error has occured');
      console.error(err);
    } else if (wiki) {
      res.write('\n' +wiki.title + ' Sections:\n');
      wiki.sections.forEach(function(section) {
        res.write('\n' + section.title);
      })
    } else {
      res.write('\nNo such wiki exists');
    }

    res.send();
  });
});

app.post('/:wikiTitle', function(req, res) {
  wikiModel.findOne({ title: req.params.wikiTitle }, function(err, wiki) {
    if (err) {
      res.send('\nAn unkown error has occured');
      console.error(err);
    } else if (wiki) {
      res.send('\n' +req.params.wikiTitle + ' already exists');
    } else {
      wikiModel.create({ title: req.params.wikiTitle }, function(err) {
        if (err) {
          res.write('\nAn unkown error has occured');
          console.error(err);
        } else {
          res.write('\nCreated new wiki with title: ' + req.params.wikiTitle)
        }
        res.send();
      });
    }
  });
});

app.put('/:wikiTitle', function(req, res) {
  wikiModel.findOne({ title: req.params.wikiTitle }, function(err, wiki) {
    if (err) {
      res.send('\nAn unkown error has occured');
      console.error(err);
    } else if (wiki) {
      wikiModel.updateOne({ title: req.params.newTitle }, { $set: { title: req.body.newTitle } },
      function(err, newWiki) {
        if (err) {
          res.write('\nAn unkown error has occured');
          console.error(err);
        } else {
          res.write('\nUpdated wiki ' + req.params.wikiTitle + ' with title: ' + newWiki.title)
        }
        res.send();
      });
    } else {
      res.send('\nNo such wiki exists');
    }
  });
});

app.delete('/:wikiTitle', function(req, res) {
  wikiModel.findOne({ title: req.params.wikiTitle }, function(err, wiki) {
    if (err) {
      res.send('\nAn unkown error has occured');
      console.error(err);
    } else if (wiki) {
      wikiModel.deleteOne({ title: req.params.wikiTitle }, function(err) {
        if (err) {
          res.write('\nAn unkown error has occured');
          console.error(err);
        } else {
          res.write('\nWiki ' + req.params.wikiTitle + ' was succesfully deleted');
        }
        res.send();
      });
    } else {
      res.send('\nNo such wiki exists');
    }

  });
});

/* SECTIONS */
app.get('/:wikiTitle/:sectionTitle', function(req, res) {
  sectionModel.findOne({ title: req.params.sectionTitle }, function(err, section) {
    if (err) {
      res.write('\nAn unkown error has occured');
      console.error(err);
    } else if (section) {
      res.write('\n' +section.title + ' Notes:\n');
      section.notes.forEach(function(note) {
        res.write('\n' + note.title);
      })
    } else {
      res.write('\nNo such section exists');
    }

    res.send();
  });
});

app.post('/:wikiTitle/:sectionTitle', function(req, res) {
  sectionModel.findOne({ title: req.params.sectionTitle }, function(err, section) {
    if (err) {
      res.send('\nAn unkown error has occured');
      console.error(err);
    } else if (section) {
      res.send('\n' +req.params.sectionTitle + ' already exists');
    } else {
      sectionModel.create({ title: req.params.sectionTitle }, function(err) {
        if (err) {
          res.write('\nAn unkown error has occured');
          console.error(err);
        } else {
          res.write('\nCreated new section with title: ' + req.params.sectionTitle)
        }
        res.send();
      });
    }
  });
});

app.put('/:wikiTitle/:sectionTitle', function(req, res) {
  sectionModel.findOne({ title: req.params.sectionTitle }, function(err, section) {
    if (err) {
      res.send('\nAn unkown error has occured');
      console.error(err);
    } else if (section) {
      sectionModel.updateOne({ title: req.params.newTitle }, { $set: { title: req.body.newTitle } },
      function(err, newSection) {
        if (err) {
          res.write('\nAn unkown error has occured');
          console.error(err);
        } else {
          res.write('\nUpdated section ' + req.params.sectionTitle + ' with title: ' + newSection.title)
        }
        res.send();
      });
    } else {
      res.send('\nNo such section exists');
    }
  });
});

app.delete('/:wikiTitle/:sectionTitle', function(req, res) {
  sectionModel.findOne({ title: req.params.sectionTitle }, function(err, section) {
    if (err) {
      res.send('\nAn unkown error has occured');
      console.error(err);
    } else if (section) {
      sectionModel.deleteOne({ title: req.params.sectionTitle }, function(err) {
        if (err) {
          res.write('\nAn unkown error has occured');
          console.error(err);
        } else {
          res.write('\nSection ' + req.params.sectionTitle + ' was succesfully deleted');
        }
        res.send();
      });
    } else {
      res.send('\nNo such section exists');
    }
  });
});

/* NOTES */
app.get('/:wikiTitle/:sectionTitle/:noteTitle', function(req, res) {
  noteModel.findOne({ title: req.params.noteTitle }, function(err, note) {
    if (err) {
      res.write('\nAn unkown error has occured');
      console.error(err);
    } else if (note) {
      res.write('\n' + note.title + '\n' + note.content);
    } else {
      res.write('\nNo such note exists');
    }

    res.send();
  });
});

app.post('/:wikiTitle/:sectionTitle/:noteTitle', function(req, res) {
  noteModel.findOne({ title: req.params.noteTitle }, function(err, note) {
    if (err) {
      res.send('\nAn unkown error has occured');
      console.error(err);
    } else if (note) {
      res.send(req.params.noteTitle + ' already exists');
    } else {
      noteModel.create({ title: req.params.noteTitle, content: req.body.content }, function(err) {
        if (err) {
          res.write('\nAn unkown error has occured');
          console.error(err);
        } else {
          res.write('\nCreated new note with title: ' + req.params.noteTitle)
        }
        res.send();
      });
    }
  });
});

app.put('/:wikiTitle/:sectionTitle/:noteTitle', function(req, res) {
  noteModel.findOne({ title: req.params.noteTitle }, function(err, note) {
    if (err) {
      res.send('\nAn unkown error has occured');
      console.error(err);
    } else if (note) {
      noteModel.updateOne({ title: req.params.newTitle }, { $set: { title: req.body.newTitle } },
      function(err, newnote) {
        if (err) {
          res.write('\nAn unkown error has occured');
          console.error(err);
        } else {
          res.write('\nUpdated note ' + req.params.noteTitle + ' with title: ' + newnote.title)
        }
        res.send();
      });
    } else {
      res.send('\nNo such note exists');
    }
  });
});

app.delete('/:wikiTitle/:sectionTitle/:noteTitle', function(req, res) {
  noteModel.findOne({ title: req.params.noteTitle }, function(err, note) {
    if (err) {
      res.send('\nAn unkown error has occured');
      console.error(err);
    } else if (note) {
      noteModel.deleteOne({ title: req.params.noteTitle }, function(err) {
        if (err) {
          res.write('\nAn unkown error has occured');
          console.error(err);
        } else {
          res.write('\nNote ' + req.params.noteTitle + ' was succesfully deleted');
        }
        res.send();
      });
    } else {
      res.send('\nNo such note exists');
    }
  });
});

app.listen(PORT, function() {
  console.log('Server listening on: ' + SERVER);
});