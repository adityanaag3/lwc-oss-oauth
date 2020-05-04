import { LightningElement, track } from 'lwc';
import { getLoggedInUser } from 'data/authService';

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
        this.state = 'logout';
        this.loggedUser = undefined;
    }

    get isLoginView() {
        return this.state === 'login';
    }

    get isSessionListView() {
        return this.state === 'list';
    }

    get isLogoutView() {
        return this.state === 'logout';
    }
}
