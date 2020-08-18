const auth = require(__dirname + '/static/auth');
const express = require('express');
const mongoose = require('mongoose');

const app = express();

const HOST = 'http://localhost';
const PORT = '8081';
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
const sectionSchema = new mongoose.Schema({ title: String, note: [noteSchema] });
const wikiSchema = new mongoose.Schema({ title: String, chapter: [sectionSchema] });

const noteModel = mongoose.model("Note", noteSchema);
const sectionModel = mongoose.model("Section", sectionSchema);
const wikiModel = mongoose.model("Wiki", wikiSchema);

app.get('/', function(req, res) {
  res.write('\nWelcome to WiKi!\n');
  wikiModel.find({}, function(err, wikis) {
    if (err) {
      console.error(err);
      res.write('Error - ' + err.message);
    } else {
      if (wikis.length === 0) {
        res.write('[ No wikis to show ]')
      } else {
        res.write('Wikis:');
        wikis.forEach(function(wiki) {
          res.write('\n'+wiki.title);
        });
      }
    }
    res.send();
  })
});

app.delete('/', function(req, res) {
  wikiModel.deleteMany({}, function(err) {
    if (err) {
      console.error(err);
      res.send('Error - ' + err.message);
    } else {
      res.send('\nDeleted all wikis');
    }
  }) 
})

// TODO: Validate existance
app.get('/:wikiTitle', function(req, res) {
  wikiModel.find({ name: req.params.wikiTitle }, function(err, wiki) {
    if (err) {
      console.error(err);
      res.send('Error - ' + err.message);
    } else {
      res.send('Found ' + wiki.title);
    }
  })
});

app.post('/:wikiTitle', function(req, res) {
  wikiModel.create({ title: req.params.wikiTitle }, function(err) {
    if (err) {
      console.error(err);
      res.send('Error - ' + err.message);
    } else {
      res.send('\nCreated new wiki with title: ' + req.params.wikiTitle)
    }
  });
});

// TODO
app.put('/:wikiTitle', function(req, res) {
  res.write('\nThis would search for a wiki object with title: ' + req.params.wikiTitle);
  res.write(' and update its title to one passed as data');
  res.send();
  // wikiModel.updateOne({ title: req.params.newTitle }, function(err, wiki) {
  //   if (err) {
  //     console.error(err);
  //     res.send('Error - ' + err.message);
  //   } else {
  //     res.send('\nUpdate wiki ' + req.params.wikiTitle + ' with title: ' + wiki.title)
  //   }
  // });
});

app.delete('/:wikiTitle', function(req, res) {
  wikiModel.deleteOne({ title: req.params.wikiTitle }, function(err) {
    if (err) {
      console.error(err);
      res.send('Error - ' + err.message);
    } else {
      res.send('\nWiki ' + req.params.wikiTitle + ' was succesfully deleted');
    }
  });
});

app.get('/:wikiTitle/:sectionTitle', function(req, res) {
  res.write('\nThis would search for a wiki object with title: ' + req.params.wikiTitle);
  res.write('\nand then for a section object with title: ' + req.params.sectionTitle);
  res.write(' and display all its notes');
  res.send();
});

app.get('/:wikiTitle/:sectionTitle/:noteTitle', function(req, res) {
  res.write('\nThis would search for a wiki object with title: ' + req.params.wikiTitle);
  res.write('\nand then for a section object with title: ' + req.params.sectionTitle);
  res.write('\nand then for a note object with title: ' + req.params.noteTitle);
  res.write(' and display its content');
  res.send();
});

app.listen(PORT, function() {
  console.log('Server listening on: ' + SERVER);
});