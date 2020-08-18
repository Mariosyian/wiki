# WiKi

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