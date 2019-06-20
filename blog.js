const path =
    require('path');
const express =
    require('express');
const bodyParser =
    require('body-parser');
const session =
    require('express-session')
const dotenv =
    require('dotenv').config();
const fs =
    require('fs');
const http =
    require('http');
const {
    authHandlers
} = require('./auth.js')
const {
    entryHandlers
} = require('./entries.js')
const {
    commentHandlers
} = require('./comment.js')
const {
    User,
    Comment,
    Entry,
    database
} = require('./models.js')

const utils = require('./util.js')

const server = express();
server.set('view engine', 'ejs');

server.use(express.static(path.join(__dirname, 'static')));
server.use(bodyParser.urlencoded({
    'extended': true
}));
server.use(session({
    secret: utils.getSessionSecret(),
    resave: false,
    saveUninitialized: true
}));

server.use((request, response, next) => {
    if (!request.session.errors) {
        request.session.errors = [];
    }

    next();
});

authHandlers(server);
entryHandlers(server);
commentHandlers(server);

database.sync().then(() => {
    return User.upsert({
        'login': 'administrator',
        'credentials': utils.getAdminPassword(),
        'administrator': true
    });
}).then(() => {
    return User.upsert({
        'login': 'user',
        'credentials': utils.getUserPassword(),
        'administrator': false
    });
}).then(() => {
    http.createServer(server).listen(utils.getServerPort(), () => {
        console.log(`The server is listening on port '${utils.getServerPort()}'.`);
    });
});