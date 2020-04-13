const URL = '/api/conference-sessions/';
let sessions = [];

export const getSessions = () =>
    fetch(URL)
        .then((response) => {
            if (!response.ok) {
                throw new Error('No response from server');
            }
            return response.json();
        })
        .then((result) => {
            sessions = result.data;
            return sessions;
        });

export const getSession = (sessionId) => {
    return sessions.find((session) => {
        return session.id === sessionId;
    });
};
