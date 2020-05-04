const jsforce = require('jsforce');

module.exports = class AuthenticationService {
    /**
     * Builds the authentication service
     * @param {winston.Logger} logger
     * @param {jsforce.OAuth2} oauth2
     */
    constructor(logger, oauth2) {
        this.logger = logger;
        this.oauth2 = oauth2;
    }

    /**
     * Attempts to retrieve the server session.
     * If there is no session, redirects with HTTP 401 and an error message.
     * @param {Object} req - server request
     * @param {Object} res - server response
     * @returns {Object} session data or null if there was no session
     */
    getSession(req, res) {
        const { session } = req;
        if (session.sfdcAccessToken === undefined) {
            res.status(401).send('Unauthorized');
            return null;
        }
        return session;
    }

    /**
     * Redirects user to Salesforce login page for authorization
     * @param {Object} res - server response
     */
    redirectToAuthUrl(res) {
        res.redirect(this.oauth2.getAuthorizationUrl({ scope: 'api' }));
    }

    /**
     * Retrieves and stores OAuth2 token from authentication callback
     * @param {Object} req - server request
     * @param {Object} res - server response
     */
    doCallback(req, res) {
        if (!req.query.code) {
            this.logger.error(
                'Failed to get authorization code from server callback.'
            );
            res.status(500).send(
                'Failed to get authorization code from server callback.'
            );
            return;
        }
        const conn = new jsforce.Connection({ oauth2: this.oauth2 });
        const { code } = req.query;
        conn.authorize(code, (error) => {
            if (error) {
                this.logger.error(
                    'Failed to authorize request with provided authentication code'
                );
                res.status(500).send(error);
                return;
            }
            req.session.sfdcAccessToken = conn.accessToken;
            req.session.sfdcInstanceUrl = conn.instanceUrl;
            res.redirect('/');
        });
    }

    /**
     * Gets logged in user details
     * @param {Object} req - server request
     * @param {Object} res - server response
     * @returns {Object} user info or an empty object if user is not logged in
     */
    getLoggedInUserDetails(req, res) {
        // Check for existing session
        const { session } = req;
        if (session.sfdcAccessToken === undefined) {
            res.status(200).send({});
            return;
        }
        // Connect to Salesforce and fetch user info
        const conn = new jsforce.Connection({
            accessToken: session.sfdcAccessToken,
            instanceUrl: session.sfdcInstanceUrl
        });
        conn.identity((error, data) => {
            if (error) {
                this.logger.error(
                    'Failed to retrieve logged in user details',
                    error
                );
                res.status(500).send(error);
                return;
            }
            res.json(data);
        });
    }

    /**
     * Destroys session and revokes Salesforce OAuth2 token
     * @param {Object} req - server request
     * @param {Object} res - server response
     */
    doLogout(req, res) {
        const session = this.getSession(req, res);
        if (session === null) {
            return;
        }

        const conn = new jsforce.Connection({
            accessToken: session.sfdcAccessToken,
            instanceUrl: session.sfdcInstanceUrl
        });

        conn.logout((error) => {
            if (error) {
                this.logger.error(
                    'Failed to revoke authentication token',
                    error
                );
                res.status(500).json(error);
            } else {
                session.destroy((err) => {
                    if (err) {
                        this.logger.error(
                            'Failed to destroy server session',
                            err
                        );
                        res.status(500).send(
                            'Failed to destroy server session'
                        );
                    } else {
                        res.redirect('/');
                    }
                });
            }
        });
    }
};
