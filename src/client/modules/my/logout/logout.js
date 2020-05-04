import { LightningElement, track } from 'lwc';

export default class Logout extends LightningElement {
    @track logoutUrl;
    @track errorMessage;
    @track logoutStatus = 'Please wait while we log you out of the app...';

    connectedCallback() {
        fetch('/oauth2/logout')
            .then((response) => {
                if (!response.ok) {
                    throw Error(response.statusText);
                }
                return response.text();
            })
            .then((finalResponse) => {
                this.logoutUrl = finalResponse;
                this.logoutStatus = 'Please wait while we log you out of Salesforce...';
                // eslint-disable-next-line @lwc/lwc/no-async-operation
                setTimeout(function () {
                    window.location.href = '/';
                }, 5000);
            })
            .catch((error) => {
                // Handle the error
                this.errorMessage = error;
            });
    }
}
