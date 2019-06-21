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
const https =
    require('https');

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

const privateKey = fs.readFileSync('/etc/letsencrypt/live/devcit-js-10.auca.space/privkey1.pem', 'utf8');
const certificate = fs.readFileSync('/etc/letsencrypt/live/devcit-js-10.auca.space/cert1.pem', 'utf8');
const ca = fs.readFileSync('/etc/letsencrypt/live/devcit-js-10.auca.space/chain1.pem', 'utf8');

const credentials = {
	'key': privateKey,
	'cert': certificate,
	'ca': ca
};

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
    const httpsServer = https.createServer(credentials, server);
    httpsServer.listen(utils.getServerPort(), () => {
        console.log(`The server is listening on port '${utils.getServerPort()}'.`);
    });
});
