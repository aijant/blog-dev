const Sequelize =
    require('sequelize');
const utils = require('./util.js')

const database = new Sequelize(utils.getDatabaseName(), 
utils.getDatabaseUser(), utils.getDatabasePassword(), {
    'host': utils.getDatabaseHost(),
    'port': utils.getDatabasePort(),
    'dialect': utils.getDatabaseDialect(),
    'dialectOptions': {
        'charset': 'utf8'
    }
});

const User = database.define('user', {
    'login': {
        'type': Sequelize.STRING,
        'allowNull': false,
        'unique': true
    },
    'credentials': {
        'type': Sequelize.STRING,
        'allowNull': false
    },
    'administrator': {
        'type': Sequelize.BOOLEAN,
        'allowNull': false,
        'defaultValue': false
    }
});

const Entry = database.define('entry', {
    'title': {
        'type': Sequelize.STRING,
        'allowNull': false
    },
    'content': {
        'type': Sequelize.STRING,
        'allowNull': false
    }
});

const Comment = database.define('comment', {
    'content': {
        'type': Sequelize.STRING,
        'allowNull': false
    }
});

User.hasMany(Comment);
Entry.hasMany(Comment);
Comment.belongsTo(User);
Comment.belongsTo(Entry);

module.exports = {
    User,
    Entry,
    Comment,
    database
};