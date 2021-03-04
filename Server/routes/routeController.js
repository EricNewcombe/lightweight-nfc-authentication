module.exports = function (app) {
    const clientAuth = require('./client-auth');
    const tagAuth = require('./tag-auth');
    const {nfcClient, nfcTag} = require('./initialize-nfc')

    app.use('/auth/tag', tagAuth);
    app.use('/auth/client', clientAuth);
    app.use('/initialize-nfc/client', nfcClient);
    app.use('/initialize-nfc/tag', nfcTag);
}