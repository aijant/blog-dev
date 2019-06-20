const {
    Entry, Comment, User
} = require('./models')

const entryHandlers = (server) => {
    server.get(['/', '/entries'], (request, response) => {
        Entry.findAll().then(entries => {
            response.render('entries', {
                'session': request.session,
                'entries': entries
            });
        }).catch(error => {
            console.error(error);

            response.status(500).end('Internal Server Error');
        });
    });

    server.get(['/entry/create', '/entry/:id/update'], (request, response) => {
        if (!request.session.authorized) {
            response.status(401).end('Unauthorized');

            return;
        }

        if (!request.session.administrator) {
            response.status(403).end('Forbidden');

            return;
        }

        const previousLocation = request.header('Referer') || '/entries';

        let entry = undefined;
        if (request.path === '/entry/create') {
            response.render('entry-create-update', {
                'session': request.session,
                'entry': null
            });
        } else {
            id = request.params['id'];
            if (!id) {
                request.session.errors.push('The blog entry is unknown.');
                response.redirect(previousLocation);

                return;
            }

            Entry.findById(id).then(entry => {
                response.render('entry-create-update', {
                    'session': request.session,
                    'entry': entry
                });
            }).catch(error => {
                console.error(error);

                request.session.errors.push('Failed to find the specified blog entry.')
                response.redirect(previousLocation);
            });
        }
    });

    server.post(['/entry/create', '/entry/:id/update'], (request, response) => {
        if (!request.session.authorized) {
            response.status(401).end('Unauthorized');

            return;
        }

        if (!request.session.administrator) {
            response.status(403).end('Forbidden');

            return;
        }

        const destination = request.header('Referer') || '/entries';

        let id = undefined;
        if (!request.path.endsWith('/create')) {
            id = request.params['id'];
            if (!id) {
                request.session.errors.push('The blog entry is unknown.');
                response.redirect(destination);

                return;
            }
        }

        const title = request.body['title'];
        if (!title) {
            request.session.errors.push('The entry title must be specified.');
        }

        const content = request.body['content'];
        if (!content) {
            request.session.errors.push('The entry content must be specified.');
        }

        if (request.session.errors.length > 0) {
            response.redirect(destination);

            return;
        }

        if (id) {
            Entry.update({
                'title': title,
                'content': content
            }, {
                'where': {
                    'id': id
                }
            }).then(result => {
                response.redirect(`/entry/${id}`);
            }).catch(error => {
                console.error(error);

                request.session.errors.push('Failed to create a new blog entry.');
                response.redirect(`/entry/${id}`);
            });
        } else {
            Entry.create({
                'title': title,
                'content': content
            }).then(entry => {
                response.redirect(`/entry/${entry.id}`);
            }).catch(error => {
                console.error(error);

                request.session.errors.push('Failed to create a new blog entry.');
                response.redirect(destination);
            });
        }
    });

    server.post('/entry/:id/delete', (request, response) => {
        if (!request.session.authorized) {
            response.status(401).end('Unauthorized');

            return;
        }

        if (!request.session.administrator) {
            response.status(403).end('Forbidden');

            return;
        }

        const previousLocation = request.header('Referer') || '/entries';

        const id = request.params['id'];
        if (!id) {
            request.session.errors.push('The blog entry is unknown.');
            response.redirect(previousLocation);

            return;
        }

        Entry.destroy({
            'where': {
                'id': id
            }
        }).then(() => {
            response.redirect('/entries');
        }).catch(error => {
            console.error(error);

            request.session.errors.push('Failed to remove the blog entry.');
            response.redirect('/entries');
        });
    });

    server.get('/entry/:id', (request, response) => {
        const previousLocation = request.header('Referer') || '/entries';

        const id = request.params['id'];
        if (!id) {
            request.session.errors.push('The blog entry is unknown.');
            response.redirect(previousLocation);

            return;
        }

        Entry.findById(id, {
            'include': [{
                'model': Comment,
                'include': [User]
            }]
        }).then(entry => {
            response.render('entry', {
                'session': request.session,
                'entry': entry,
                'comment': null
            });
        }).catch(error => {
            console.error(error);

            request.session.errors.push('The blog entry was not found.');
            response.redirect(previousLocation);
        });
    });
}
module.exports = {
    entryHandlers
};