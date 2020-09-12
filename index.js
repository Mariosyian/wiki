const auth = require(__dirname + '/static/auth');
const bodyParser = require('body-parser');
const express = require('express');
const mongoose = require('mongoose');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
mongoose.set('useFindAndModify', false);

const HOST = 'http://localhost';
const PORT = '8080';
const SERVER = HOST + ':' + PORT + '/';

const database = 'mongodb+srv://' + auth.mongoUser + ':' + auth.mongoPass +'@wikis.dciy0.mongodb.net/wikis'
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
        const sectionsLength = wiki.sections ? wiki.sections.length : 0;
        res.write('\n\t' + wiki.title + '\t(' + sectionsLength + ' Sections)');
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
      res.write('\nDeleted all wikis.');
    }

    res.send();
  });
})

/* WIKIS */
app.get('/:wikiTitle', function(req, res) {
  getWiki(req.params.wikiTitle, function (err, wiki) {
    if (err) {
      return res.send(err);
    }
    if (wiki.sections == null || wiki.sections.length === 0) {
      res.write('\n[ No sections to show ]');
    } else {
      res.write('\n' + wiki.title + ' Sections:\n');
      wiki.sections.forEach(function(section) {
        const notesLength = section.notes ? section.notes.length : 0;
        res.write('\n\t' + section.title + '\t(' + notesLength + ' note(s))');
      })
    }
    res.send();
  });
});

app.post('/:wikiTitle', function(req, res) {
  const wikiTitle = req.params.wikiTitle;

  wikiModel.findOne({ title: wikiTitle }, function(err, wiki) {
    if (err) {
      res.send('\nAn unkown error has occured');
      console.error(err);
    } else if (wiki) {
      res.send('\n' + wikiTitle + ' already exists');
    } else {
      new wikiModel({ title: wikiTitle }, function(err) {
        if (err) {
          res.write('\nAn unkown error has occured');
          console.error(err);
        } else {
          res.write('\nCreated new wiki to ' + wikiTitle)
        }
        res.send();
      }).save();
    }
  });
});

app.put('/:wikiTitle', function(req, res) {
  const wikiTitle = req.params.wikiTitle;

  if (req.body.newTitle == null) {
    res.send('\nPlease refer to the documentation for API usage');
  } else {
    const newTitle = req.body.newTitle;

    wikiModel.findOneAndUpdate({ title: wikiTitle }, { $set: { title: newTitle } },
    function(err, wiki) {
      if (err) {
        res.send('\nAn unkown error has occured');
        console.error(err);
      } else if (wiki) {
        res.send('\nUpdated wiki ' + wiki.title + ' to ' + newTitle);
      } else {
        res.send('\nNo such wiki exists');
      }
    });
  }
});

app.delete('/:wikiTitle', function(req, res) {
  const wikiTitle = req.params.wikiTitle;

  wikiModel.findOneAndDelete({ title: wikiTitle }, function(err, wiki) {
    if (err) {
      res.send('\nAn unkown error has occured');
      console.error(err);
    } else if (wiki) {
      res.send('\nWiki ' + wikiTitle + ' was succesfully deleted');
    } else {
      res.send('\nNo such wiki exists');
    }
  });
});

/* SECTIONS */
app.get('/:wikiTitle/:sectionTitle', function(req, res) {
  getWiki(req.params.wikiTitle, function (err, title) {
    if (err) {
      return res.send(err);
    }
    getSection(req.params.sectionTitle, function (err, s) {
      if (err) {
          return res.send(err);
      }
      const section = s.sections.find((s) => { return s.title === req.params.sectionTitle; });
      
      res.write('\n' + req.params.sectionTitle + ' Notes:\n');
      if (section.notes == null || section.notes.length === 0) {
        res.write('\n[ No notes to show ]');
      } else {
        section.notes.forEach(function(note) {
          res.write('\n\t' + note.title);
        })
        res.send();
      }
    });
  });
});

app.post('/:wikiTitle/:sectionTitle', function(req, res) {
  const wikiTitle = req.params.wikiTitle;
  
  wikiModel.findOne({ title: wikiTitle }, function(err, wiki) {
    if (err) {
      res.send('\nAn unkown error has occured');
      console.error(err);
    } else if (wiki) {
      const sectionTitle = req.params.sectionTitle;

      wikiModel.findOne({ 'sections.title': sectionTitle }, function(err, section) {
        if (err) {
          res.send('\nAn unkown error has occured');
          console.error(err);
        } else if (section) {
          res.send('\n' + sectionTitle + ' already exists');
        } else {
          // Maybe I can use the wiki object returned? $set $pull/$push?
          const newSection = {
            title: sectionTitle
          };

          wikiModel.findOneAndUpdate({ title: wikiTitle }, { $push: { sections: newSection } },
          function(err) {
            if (err) {
              res.send('\nAn unkown error has occured');
              console.error(err);
            } else {
              res.send('\nCreated new section: ' + sectionTitle)
            }
          });
        }
      });
    } else {
      res.send('\nNo such wiki exists');
    }
  });
});

app.put('/:wikiTitle/:sectionTitle', function(req, res) {
  const wikiTitle = req.params.wikiTitle;
  
  if (req.body.newTitle == null) {
    res.send('\nPlease refer to the documentation for API usage');
  } else {
    wikiModel.findOne({ title: wikiTitle }, function(err, wiki) {
      if (err) {
        res.send('\nAn unkown error has occured');
        console.error(err);
      } else if (wiki) {
        const sectionTitle = req.params.sectionTitle;
        const newTitle = req.body.newTitle;
  
        wikiModel.findOneAndUpdate({ 'sections.title': sectionTitle }, { $set: { 'sections.$.title': newTitle} },
        function(err, section) {
          if (err) {
            res.send('\nAn unkown error has occured');
            console.error(err);
          } else if (section) {
            res.send('\nUpdated section ' + sectionTitle + ' to ' + newTitle)
          } else {
            res.send('\nNo such section exists');
          }
        });
      } else {
        res.send('\nNo such wiki exists');
      }
    });
  }
});

app.delete('/:wikiTitle/:sectionTitle', function(req, res) {
  const wikiTitle = req.params.wikiTitle;
  
  wikiModel.findOne({ title: wikiTitle }, function(err, wiki) {
    if (err) {
      res.send('\nAn unkown error has occured');
      console.error(err);
    } else if (wiki) {
      const sectionTitle = req.params.sectionTitle;

      wikiModel.findOneAndUpdate({ 'sections.title': sectionTitle }, { $pull: { sections: { title: sectionTitle } } },
      function(err, section) {
        if (err) {
          res.send('\nAn unkown error has occured');
          console.error(err);
        } else if (section) {
          res.send('\nSection ' + sectionTitle + ' was succesfully deleted');
        } else {
          res.send('\nNo such section exists');
        }
      });
    } else {
      res.send('\nNo such wiki exists');
    }
  });
});

/* NOTES */
app.get('/:wikiTitle/:sectionTitle/:noteTitle', function(req, res) {
  getWiki(req.params.wikiTitle, function (err, title) {
    if (err) {
      return res.send(err);
    }
    getSection(req.params.sectionTitle, function (err, section) {
      if (err) {
          return res.send(err);
      }
      getNote(req.params.noteTitle, function (err, n) {
        if (err) {
            return res.send(err);
        }
        const section = n.sections.find((s) => { return s.title === req.params.sectionTitle; });
        const note = section.notes.find((n) => { return n.title === req.params.noteTitle; });

        if (note.content) {
          res.send('\n' + note.title + '\n\n' + note.content);
        } else {
          res.send('\n' + note.title + '\n\n[ No content to show ]');
        }
      });
    });
  });
});

app.post('/:wikiTitle/:sectionTitle/:noteTitle', function(req, res) {

  let note = {
    title: req.params.noteTitle,
    content: ''
  };

  if (req.body.content) {
    note.content = req.body.content;
  }

  wikiModel.findOne({ title: req.params.wikiTitle }, function(err, wiki) {
    if (err) {
      res.send('\nAn unkown error has occured');
      console.error(err);
    } else if (wiki) {
      const sectionTitle = req.params.sectionTitle;

      wikiModel.findOne({ 'sections.title': sectionTitle }, function(err, section) {
        if (err) {
          res.send('\nAn unkown error has occured');
          console.error(err);
        } else if (section) {
          const noteTitle = req.params.noteTitle;

          wikiModel.findOne({ 'sections.notes.title': noteTitle }, function(err, n) {
            if (err) {
              res.send('\nAn unkown error has occured');
              console.error(err);
            } else if (n) {
              res.send('\n' + noteTitle + ' already exists');
            } else {

              wikiModel.findOneAndUpdate({ 'sections.title': sectionTitle },
              { $push: { 'sections.$.notes': note } },
              function(err) {
                if (err) {
                  res.write('\nAn unkown error has occured');
                  console.error(err);
                } else {
                  res.write('\nCreated new note: ' + noteTitle)
                }

                res.send();
              });
            }
          });
        } else {
          res.send('\nNo such section exists');
        }
      });
    } else {
      res.send('\nNo such wiki exists');
    }
  });
});

app.put('/:wikiTitle/:sectionTitle/:noteTitle', function(req, res) {
  if (req.body.content == null && req.body.newTitle == null) {
    res.send('\nPlease refer to the documentation for API usage');
  } else {
    wikiModel.findOne({ title: req.params.wikiTitle }, function (err, wiki) {
      if (err) {
        res.send('\nAn unkown error has occured');
        console.error(err);
      } else if (wiki) {
        wikiModel.findOne({ 'sections.title': req.params.sectionTitle }, function (err, section) {
          if (err) {
            res.send('\nAn unkown error has occured');
            console.error(err);
          } else if (section) {
            const noteTitle = req.params.noteTitle;

            wikiModel.findOne({ 'sections.notes.title': noteTitle }, function (err, note) {
              if (err) {
                res.send('\nAn unkown error has occured');
                console.error(err);
              } else if (note) {
                note.sections[0].notes.forEach( (n) => {
                  if (req.body.content) {
                    if (n.title === noteTitle) {
                      n.content = req.body.content;
                      res.write('\nUpdated note ' + noteTitle + "'s content succesfully");
                    }
                  }

                  if (req.body.newTitle) {
                    if (n.title === noteTitle) {
                      n.title = req.body.newTitle;
                      res.write('\nUpdated note ' + noteTitle + ' to ' + req.body.newTitle);
                    }
                  }
                });

                note.save();
                res.send();
              } else {
                res.send('\nNo such note exists');
              }
            });
          } else {
            res.send('\nNo such section exists');
          }
        });
      } else {
        res.send('\nNo such wiki exists');
      }
    });
  }
});

app.delete('/:wikiTitle/:sectionTitle/:noteTitle', function(req, res) {
  wikiModel.findOne({ title: req.params.wikiTitle }, function (err, wiki) {
    if (err) {
      res.send('\nAn unkown error has occured');
      console.error(err);
    } else if (wiki) {
      wikiModel.findOne({ 'sections.title': req.params.sectionTitle }, function (err, section) {
        if (err) {
          res.send('\nAn unkown error has occured');
          console.error(err);
        } else if (section) {
          const noteTitle = req.params.noteTitle;

          wikiModel.findOneAndUpdate({ 'sections.notes.title': noteTitle },
          { $pull: { 'sections.$[].notes': { title: noteTitle } } },
          function (err, note) {
            if (err) {
              res.send('\nAn unkown error has occured');
              console.error(err);
            } else if (note) {
              res.send('\nNote ' + noteTitle + ' was succesfully deleted');
            } else {
              res.send('\nNo such note exists');
            }
          });
        } else {
          res.send('\nNo such section exists');
        }
      })
    } else {
      res.send('\nNo such wiki exists');
    }
  });
});

/* UTILITY METHODS */
function getWiki(wikiTitle, cb) {
  wikiModel.findOne({ title: wikiTitle }, function(err, wiki) {
    if (err) {
      console.error(err);
      return cb('An unknown error occured.');
    } else if (wiki) {
      return cb(null, wiki);
    } else {
      return cb('No wiki found');
    }
  });
}

function getSection(sectionTitle, cb) {
  wikiModel.findOne({ 'sections.title': sectionTitle }, function(err, section) {
    if (err) {
      console.error(err);
      return cb('An unknown error occured.');
    } else if (section) {
      return cb(null, section);
    } else {
      return cb('No section found');
    }
  });
}

function getNote(noteTitle, cb) {
  wikiModel.findOne({ 'sections.notes.title': noteTitle }, function(err, note) {
    if (err) {
      console.error(err);
      return cb('An unknown error occured.');
    } else if (note) {
      return cb(null, note);
    } else {
      return cb('No note found');
    }
  });
}

app.listen(PORT, function() {
  console.log('Server listening on: ' + SERVER);
});