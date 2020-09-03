const auth = require(__dirname + '/static/auth');
const bodyParser = require('body-parser');
const express = require('express');
const mongoose = require('mongoose');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

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

const noteModel = mongoose.model("Note", noteSchema);
const sectionModel = mongoose.model("Section", sectionSchema);
const wikiModel = mongoose.model("Wiki", wikiSchema);

app.get('/', function(req, res) {
  res.write('\nWelcome to WiKi!\n');

  const wiki = new wikiModel({
    title: 'TestWiki',
    sections: [{
      title: 'TestSection',
      notes: [{
        title: 'TestNote',
        content: 'TestContent'
      }]
    },
    {
      title: 'TestSection2'
    }]
  });
  wiki.save();

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
  wikiModel.findOne({ title: req.params.wikiTitle }, function(err, wiki) {
    if (err) {
      res.write('\nAn unkown error has occured');
      console.error(err);
    } else if (wiki) {
      if (wiki.sections == null || wiki.sections.length === 0) {
        res.write('\n[ No sections to show ]');
      } else {
        res.write('\n' + wiki.title + ' Sections:\n');
        wiki.sections.forEach(function(section) {
          const notesLength = section.notes ? section.notes.length : 0;
          res.write('\n' + section.title + '\t(' + notesLength + ' note(s))');
        })
      }
    } else {
      res.write('\nNo such wiki exists');
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
  let newTitle = null;

  if (req.body.newTitle == null) {
    res.send('Please refer to the documentation for API usage');
  } else {
    newTitle = req.body.newTitle;

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
  wikiModel.findOne({ title: req.params.wikiTitle }, function(err, wiki) {
    if (err) {
      res.send('\nAn unkown error has occured');
      console.error(err);
    } else if (wiki) {
      const sectionTitle = req.params.sectionTitle;

      wikiModel.findOne({ 'sections.title': sectionTitle }, function(err, s) {
        if (err) {
          res.write('\nAn unkown error has occured');
          console.error(err);
        } else if (s) {
          const section = s.sections.find((s) => { return s.title === sectionTitle; });
          
          res.write('\n' + sectionTitle + ' Notes:\n');
          if (section.notes == null || section.notes.length === 0) {
            res.write('\n[ No notes to show ]');
          } else {
            section.notes.forEach(function(note) {
              res.write('\n' + note.title);
            })
          }
        } else {
          res.write('\nNo such section exists');
        }
    
        res.send();
      });
    } else {
      res.send('\nNo such wiki exists');
    }
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

      wikiModel.findOne({ sections: { title: sectionTitle } }, function(err, section) {
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
              res.write('\nAn unkown error has occured');
              console.error(err);
            } else {
              res.write('\nCreated new section: ' + sectionTitle)
            }
            res.send();
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
  
  wikiModel.findOne({ title: wikiTitle }, function(err, wiki) {
    if (err) {
      res.send('\nAn unkown error has occured');
      console.error(err);
    } else if (wiki) {
      let newTitle = null;
      
      if (req.body.newTitle == null) {
        res.send('Please refer to the documentation for API usage');
      } else {
        const sectionTitle = req.params.sectionTitle;
        newTitle = req.body.newTitle;

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
      }
    } else {
      res.send('\nNo such wiki exists');
    }
  });

});

app.delete('/:wikiTitle/:sectionTitle', function(req, res) {
  const wikiTitle = req.params.wikiTitle;
  
  wikiModel.findOne({ title: wikiTitle }, function(err, wiki) {
    if (err) {
      res.send('\nAn unkown error has occured');
      console.error(err);
    } else if (wiki) {
      const sectionTitle = req.params.sectionTitle;

      wikiModel.findOneAndUpdate({ title: wikiTitle }, { $pull: { sections: { title: sectionTitle } } },
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
                res.write('\nAn unkown error has occured');
                console.error(err);
              } else if (n) {
                const section = n.sections.find((s) => { return s.title === sectionTitle; });
                const note = section.notes.find((n) => { return n.title === noteTitle; });

                if (note.content) {
                  res.write('\n' + note.title + '\n' + note.content);
                } else {
                  res.write('\n' + note.title + '\n[ No content to show ]');
                }
              } else {
                res.write('\nNo such note exists');
              }

              res.send();
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

app.post('/:wikiTitle/:sectionTitle/:noteTitle', function(req, res) {

  if (req.body.content == null) {
    res.send('Please refer to the documentation for API usage');
  } else {
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
                  res.write('\nAn unkown error has occured');
                  console.error(err);
                } else if (n) {
                  res.write('\nNote already exists');
                } else {
                  // TODO: Push new note
                  const newNote = {
                    title: noteTitle
                  };

                  wikiModel.findOneAndUpdate({ 'sections.title': sectionTitle },
                  { $push: { 'sections.notes': newNote } },
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
  
                res.send();
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

app.put('/:wikiTitle/:sectionTitle/:noteTitle', function(req, res) {

  if (req.body.content == null && req.body.newTitle == null) {
    res.send('Please refer to the documentation for API usage');
  } else {
    wikiModel.findOne({ title: req.params.wikiTitle }, function(err, wiki) {
      if (err) {
        res.send('\nAn unkown error has occured');
        console.error(err);
      } else if (wiki) {
        sectionModel.findOne({ title: req.params.sectionTitle }, function(err, section) {
          if (err) {
            res.send('\nAn unkown error has occured');
            console.error(err);
          } else if (section) {
            const currentNoteTitle = req.params.noteTitle;

            if (req.body.content && req.body.newTitle == null) {
              const newContent = req.body.content;

              noteModel.findOneAndUpdate({ title: currentNoteTitle }, { $set: { content: newContent } },
              function(err, note) {
                if (err) {
                  res.send('\nAn unkown error has occured');
                  console.error(err);
                } else if (note) {
                  res.send('\nUpdated ' + currentNoteTitle + "'s content");
                } else {
                  res.send('\nNo such note exists');
                }
              });
            } else if (req.body.content == null && req.body.newTitle) {
              const newNoteTitle = req.body.newTitle;

              noteModel.findOneAndUpdate({ title: currentNoteTitle }, { $set: { title: newNoteTitle } },
              function(err, note) {
                if (err) {
                  res.send('\nAn unkown error has occured');
                  console.error(err);
                } else if (note) {
                  res.send('\nUpdated note ' + currentNoteTitle + ' to ' + newNoteTitle);
                } else {
                  res.send('\nNo such note exists');
                }
              });
            } else if (req.body.content && req.body.newTitle) {
              const newNoteTitle = req.body.newTitle;
              const newContent = req.body.content;

              noteModel.findOneAndUpdate({ title: currentNoteTitle },
              { $set: { title: newNoteTitle, content: newContent } },
              function(err, note) {
                if (err) {
                  res.send('\nAn unkown error has occured');
                  console.error(err);
                } else if (note) {
                  res.send('\nUpdated note ' + currentNoteTitle + ' to ' + newNoteTitle + ' and its content.');
                } else {
                  res.send('\nNo such note exists');
                }
              });
            }
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
  const noteTitle = req.params.noteTitle;

  noteModel.findOneAndDelete({ title: noteTitle }, function(err, note) {
    if (err) {
      res.send('\nAn unkown error has occured');
      console.error(err);
    } else if (note) {
      res.send('\nNote ' + noteTitle + ' was succesfully deleted');
    } else {
      res.send('\nNo such note exists');
    }
  });
});

app.listen(PORT, function() {
  console.log('Server listening on: ' + SERVER);
});