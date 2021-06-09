const jsforce = require('jsforce');

module.exports = class IntegrationService {
    /**
     * Builds the authentication service
     * @param {winston.Logger} logger
     * @param {AuthenticationService} authService
     */
    constructor(logger, authService) {
        this.logger = logger;
        this.authService = authService;
    }

    /**
     * Runs an SOQL query on Salesforce
     * @param {jsforce.Connection} conn - jsforce Connection
     * @param {string} soqlQuery - SOQL query
     * @returns {Promise<Array>} Promise holding an Array of records returned by SOQL query
     */
    _runSoql(conn, soqlQuery) {
        return new Promise((resolve, reject) => {
            conn.query(soqlQuery, (error, result) => {
                if (error) {
                    this.logger.error(
                        `Failed to run SOQL query: ${soqlQuery}`,
                        error
                    );
                    reject(error);
                }
                resolve(result.records);
            });
        });
    }

    /**
     * Gets Conference Session records from Salesforce
     * @param {Object} req - server request
     * @param {Object} res - server response
     */
    getConferenceSessionDetails(req, res) {
        const session = this.authService.getSession(req, res);
        if (session === null) {
            return;
        }
        const conn = new jsforce.Connection({
            accessToken: session.sfdcAccessToken,
            instanceUrl: session.sfdcInstanceUrl
        });

        // Prepare query
        let soqlQuery;
        if (req.params.id) {
            // Retrieve details of a specific session with a given id
            soqlQuery = `SELECT Id, Name, Room__c, Description__c, Date_and_Time__c, 
                (SELECT Speaker__r.Id, Speaker__r.First_Name__c, Speaker__r.Last_Name__c, Speaker__r.Bio__c, Speaker__r.Email__c FROM Session_Speakers__r) 
                FROM Session__c WHERE Id = '${req.params.id}'`;
        } else {
            // Retrieve all sessions
            // In production, this should be paginated
            soqlQuery = 'SELECT Id, Name, Date_and_Time__c FROM Session__c';
        }

        // Execute query and respond with result or error
        this._runSoql(conn, soqlQuery)
            .then((records) => {
                // Format data
                const formattedData = records.map((sessionRecord) => {
                    let speakers = [];
                    if (sessionRecord.Session_Speakers__r) {
                        speakers =
                            sessionRecord.Session_Speakers__r.records.map(
                                (record) => {
                                    return {
                                        id: record.Speaker__r.Id,
                                        name: record.Speaker__r.Name,
                                        email: record.Speaker__r.Email,
                                        bio: record.Speaker__r.Description,
                                        pictureUrl:
                                            record.Speaker__r.Picture_URL__c
                                    };
                                }
                            );
                    }
                    return {
                        id: sessionRecord.Id,
                        name: sessionRecord.Name,
                        dateTime: sessionRecord.formattedDateTime,
                        room: sessionRecord.Room__c,
                        description: sessionRecord.Description__c,
                        speakers
                    };
                });

                res.json({ data: formattedData });
            })
            .catch((error) => {
                this.logger.error(
                    'Failed to retrieve conference session(s)',
                    error
                );
                res.status(500).send(error);
            });
    }
};
