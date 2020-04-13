import { LightningElement, track } from 'lwc';
import { getLoggedInUser, logOut } from 'data/authService';

export default class App extends LightningElement {
    @track loggedUser = undefined;
    @track state;

    connectedCallback() {
        getLoggedInUser().then((response) => {
            if (response.user_id === undefined) {
                this.loggedUser = undefined;
                this.state = 'login';
            } else {
                this.loggedUser = response;
                this.state = 'list';
            }
        });
    }

    handleLogout() {
        // Log out and don't wait for server response
        logOut();
        this.state = 'login';
        this.loggedUser = undefined;
    }

    get isLoginView() {
        return this.state === 'login';
    }

    get isSessionListView() {
        return this.state === 'list';
    }
}
