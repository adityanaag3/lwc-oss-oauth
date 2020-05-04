/**
 * Gets logged in user info
 * @returns {Promise} Promise holding user info or an empty object if user is not logged in
 */
export function getLoggedInUser() {
    return new Promise((resolve, reject) => {
        fetch('/oauth2/whoami')
            .then((response) => {
                if (!response.ok) {
                    reject(response);
                }
                return response.json();
            })
            .then((jsonResponse) => resolve(jsonResponse))
            .catch((error) => {
                reject(error);
            });
    });
}
