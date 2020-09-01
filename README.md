# Wiki

Notes organiser in the form of REST API.
From this project I will try to gain a deeper understanding for RESTful APIs.
This app will be intended primarily for CLI usage with web-template integration for expansion.

# Usage
* Navigate to the root directory of the project
```
npm install
node index.js
```

# Structure
The structure behind this application is the following database relation schema:
* A User can have many Wikis/Modules
* A Wiki/Module can have many Sections/Chapters
* A Section/Chapter can have many Notes
```
wiki: {
  title: String,
  sections: [section]
},
section: {
  title: String,
  notes: [notes]
},
note: {
  title: String,
  content: String
}
```

# Documentation
The wiki program is currently meant to be used from a terminal or any API platform (e.g. PostMan).

Name | Endpoint | Operations Supported
------------ | ------------- | -------------
Root | http://localhost:8080/ | GET, DELETE
Wiki | http://localhost:8080/:wikiTitle | GET, POST, PUT, DELETE
Section | http://localhost:8080/:wikiTitle/:sectionTitle | GET, POST, PUT, DELETE
Note | http://localhost:8080/:wikiTitle/:sectionTitle/:noteTitle | GET, POST, PUT, DELETE

Notice how each entity is referenced directly by its title ```{ title: String }```. This is collected from the URI itself as a parameter.

## To get information on any of the entities
Endpoint | Parameters
------------- | -------------
http://localhost:8080/ | none
http://localhost:8080/:wikiTitle | none
http://localhost:8080/:wikiTitle/:sectionTitle | none
http://localhost:8080/:wikiTitle/:sectionTitle/:noteTitle | none
```
// Gives a list of all available wikis
curl -X GET http://localhost:8080/

// Gives a list of all sections under this wiki or a message, if not found.
curl -X GET http://localhost:8080/Wiki

// Gives a list of all notes under this section or a message, if not found.
curl -X GET http://localhost:8080/Wiki/Section

// Shows the content of the note or a message, if not found.
curl -X GET http://localhost:8080/Wiki/Section/Note
```

## To create new entities
* NOTE: All entity titles are *CASE-SENSITIVE*

Endpoint | Parameters
------------- | -------------
http://localhost:8080/:wikiTitle | none
http://localhost:8080/:wikiTitle/:sectionTitle | none
http://localhost:8080/:wikiTitle/:sectionTitle/:noteTitle | none
```
// Creates a new wiki with the title 'Wiki', displays a message if it already exists.
curl -X POST http://localhost:8080/Wiki

/**
 * Creates a new section with the title 'Section' under the wiki with title 'Wiki'
 * displays a message if it already exists.
 */
curl -X POST http://localhost:8080/Wiki/Section

/**
 * Creates a new note with the title 'Note' under the section with title 'Section',
 * which is under the wiki with title 'Wiki', displays a message if it already exists.
 */
curl -X POST http://localhost:8080/Wiki/Section/Note
```

## To update entities
Endpoint | Parameters
------------- | -------------
http://localhost:8080/:wikiTitle | newTitle: String
http://localhost:8080/:wikiTitle/:sectionTitle | newTitle: String
http://localhost:8080/:wikiTitle/:sectionTitle/:noteTitle | newTitle: String, content: String <br> **MUST** provide one or both.
```
// Updates the wiki with title 'Wiki' to 'NewWikiTitle' if it exists, displays a message if not found.
curl -X PUT --data newTitle=NewWikiTitle http://localhost:8080/Wiki

// Updates the section with title 'Section' to 'NewSectionTitle' if it exists, displays a message if not found.
curl -X PUT --data newTitle=NewSectionTitle http://localhost:8080/Wiki/Section

// Updates the note with title 'Note' to 'NewNoteTitle' if it exists, displays a message if not found.
curl -X PUT --data newTitle=NewNoteTitle http://localhost:8080/Wiki/Section/Note

// Updates the content of the note with title 'Note' to 'Lorem Ipsum' if it exists, displays a message if not found.
curl -X PUT --data "content=Lorem Ipsum" http://localhost:8080/Wiki/Section/Note

/**
 * Updates the content of the note with title 'Note' to 'Lorem Ipsum'
 * and its title to 'NewnoteTitle' if it exists, displays a message if not found.
 */
curl -X PUT --data "newTitle=NewNoteTitle&content=Lorem Ipsum" http://localhost:8080/Wiki/Section/Note
```

## To delete entities
Endpoint | Parameters
------------- | -------------
http://localhost:8080/ | none
http://localhost:8080/:wikiTitle | none
http://localhost:8080/:wikiTitle/:sectionTitle | none
http://localhost:8080/:wikiTitle/:sectionTitle/:noteTitle | none
```
// Deletes all wikis and related entities. This clears the entire database.
curl -X DELETE http://localhost:8080/

// Deletes the wiki with title 'Wiki' and related entities if it exists, displays a message if not found.
curl -X DELETE http://localhost:8080/Wiki

// Deletes the section with title 'Section' and related entities if it exists, displays a message if not found.
curl -X DELETE http://localhost:8080/Wiki/Section

// Deletes the note with title 'Note' if it exists, displays a message if not found.
curl -X DELETE http://localhost:8080/Wiki/Section/Note
```
