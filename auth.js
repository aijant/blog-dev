const {
    User
} = require('./models.js')

const utils = require('./util.js')

const bcrypt =
    require('bcrypt');

const authHandlers = (server) => {
    server.get('/login', (request, response) => {
        response.render('login', {
            'session': request.session
        });
    });

    server.post('/login', (request, response) => {
        const destination = '/';

        const login = request.body['login'];
        if (!login) {
            request.session.errors.push('The login was not provided.')
        }

        const password = request.body['password'];
        if (!password) {
            request.session.errors.push('The password was not provided.')
        }

        if (request.session.errors.length > 0) {
            response.redirect(destination);

            return;
        }

        User.findOne({
            'where': {
                'login': login
            }
        }).then(user => {
            if (!bcrypt.compareSync(password, user.credentials)) {
                request.session.errors.push('The login or password is not valid.')
                response.redirect(destination);

                return;
            }

            request.session.userID = user.id;
            request.session.authorized = true;
            request.session.administrator = user.administrator;

            response.redirect(destination);
        }).catch(error => {
            console.error(error);

            request.session.errors.push('Failed to authenticate.')
            response.redirect(destination);

            return;
        })
    });

    server.get('/register', (request, response) => {
        response.render('register', {
            'session': request.session
        });
    });

    server.post('/register', (request, response) => {
        //console.log('response', response);
        // console.log('request', request.body);

        const login = request.body['login'];
        if (!login) {
            request.session.errors.push('The login was not provided.')
        }

        const password = request.body['password'];
        if (!password) {
            request.session.errors.push('The password was not provided.')
        }

        const passwordRepeat = request.body['password-repeat'];

        if (password !== passwordRepeat) {
            request.session.errors.push('Passwords are not the same.')
        }

        if (request.session.errors.length > 0) {
            response.redirect('/register');
            return;
        }

        User.upsert({
            'login': request.body['login'],
            'credentials': utils.getEncryptedPassword(request.body['password']),
            'administrator': false
        }).then(() => {
            response.redirect("/login");
            return;
        }).catch(error => {
            console.error(error);
            request.session.errors.push('Failed to register.')
            response.redirect("/register");

            return;
        })
    });
}

module.exports = {
    authHandlers
};