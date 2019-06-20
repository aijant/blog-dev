const bcrypt =
    require('bcrypt');

const getDatabaseHost = () => {
    const databaseHost =
        process.env['BLOG_DATABASE_HOST'];
    if (databaseHost == null) {
        databaseHost = 'localhost';
        console.warn(
            'The database host "BLOG_DATABASE_HOST" is not set in the ' +
            `".env" file. Assuming the database host is "${databaseHost}".`
        );
    }
    return databaseHost;
};

const getDatabasePort = () => {
    const databasePort =
        process.env['BLOG_DATABASE_PORT'];
    if (databasePort == null) {
        databasePort = '3306';

        console.warn(
            'The database port "BLOG_DATABASE_PORT" is not set in the ' +
            `".env" file. Assuming the database port is "${databasePort}".`
        );
    }
    return databasePort;
};

const getDatabaseDialect = () => {
    const databaseDialect =
        process.env['BLOG_DATABASE_DIALECT'];
    if (databaseDialect == null) {
        databaseDialect = 'mysql';

        console.warn(
            'The database dialect "BLOG_DATABASE_DIALECT" is not set in the ' +
            `".env" file. Assuming the database dialect is "${databaseDialect}".`
        );
    }
    return databaseDialect;;
};

const getDatabaseName = () => {
    const databaseName =
        process.env['BLOG_DATABASE_NAME'];
    if (databaseName == null) {
        databaseName = 'blog';

        console.warn(
            'The database name "BLOG_DATABASE_NAME" is not set in the ' +
            `".env" file. Assuming the name of the database is "${databaseName}".`
        );
    }
    return databaseName;
};

const getDatabaseUser = () => {
    const databaseUser =
        process.env['BLOG_DATABASE_USER'];
    if (databaseUser == null) {
        databaseUser = 'blog_user';

        console.warn(
            'The database user "BLOG_DATABASE_USER" is not set in the ' +
            `".env" file. Assuming the name of the user is "${databaseUser}".`
        );
    }
    return databaseUser;
};

const getDatabasePassword = () => {
    const databasePassword =
        process.env['BLOG_DATABASE_PASSWORD'];
    if (databasePassword == null) {
        databasePassword = '';

        console.warn(
            'The database password "BLOG_DATABASE_PASSWORD" is not set in the ' +
            '".env" file. Assuming this is an unsecured development or testing ' +
            'database without a password.'
        );
    }
    return databasePassword;
};

const getServerPort = () => {
    const serverPort = process.env['BLOG_SERVER_PORT'];
    if (serverPort == null) {
        serverPort = '8080';

        console.warn(
            'The server port "BLOG_SERVER_PORT" is not set in the ' +
            `".env" file. Assuming the server port is "${serverPort}".`
        );
    }
    return serverPort;
};

const getSessionSecret = () => {
    const sessionSecret = process.env['BLOG_SESSION_SECRET'];
    if (!sessionSecret) {
        throw new Error(
            'The session secret "BLOG_SESSION_SECRET" is not set in the ' +
            '".env" file. Please, fix that and restart the server.'
        );
    }
    return sessionSecret;
};

const getEncryptedPassword = (plainPassword) => {
    return bcrypt.hashSync(plainPassword, parseInt(process.env.BLOG_PASSWORD_SALT_ROUNDS));
}

const getAdminPassword = () => {
    const adminPassword = getEncryptedPassword(process.env['BLOG_ADMIN_PASSWORD']);
    if (!adminPassword) {
        throw new Error(
            'The administrator\'s password "BLOG_ADMIN_PASSWORD" is not set in the ' +
            '".env" file. Please, fix that and restart the server.'
        );
    }
    return adminPassword;
};

const getUserPassword = () => {
    const userPassword = getEncryptedPassword(process.env['BLOG_USER_PASSWORD']);
    if (!userPassword) {
        throw new Error(
            'The test user\'s password "BLOG_USER_PASSWORD" is not set in the ' +
            '".env" file. Please, fix that and restart the server.'
        );
    }  
    return userPassword;
};

module.exports ={
    getAdminPassword,
    getDatabaseDialect,
    getDatabaseHost,
    getDatabaseName,
    getDatabasePassword,
    getDatabasePort,
    getServerPort,
    getSessionSecret,
    getUserPassword,
    getDatabaseUser,
    getEncryptedPassword
};