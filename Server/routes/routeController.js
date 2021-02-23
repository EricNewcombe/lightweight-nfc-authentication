module.exports = function (app) {
    const clientAuth = require('./client-auth');
    const tagAuth = require('./tag-auth');

    app.use('/auth/tag', tagAuth);
    app.use('/auth/client', clientAuth);
}