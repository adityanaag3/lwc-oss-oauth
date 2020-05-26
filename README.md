# Salesforce Integration with LWC OSS using OAuth Web Server Flow

This repo has the sample code for connecting to Salesforce using OAuth Web Server flow from an LWC OSS App.

## About the app

The basic version of the app is built using the Trailhead Project [Build Your First Application with Lightning Web Components Open Source](https://trailhead.salesforce.com/content/learn/projects/build-your-first-app-with-lightning-web-components-open-source).

The Salesforce Data Model for the app is created using the first 3 units of the Trailhead Project [Access Salesforce Data with Lightning Web Components Open Source](https://trailhead.salesforce.com/content/learn/projects/access-salesforce-data-with-lightning-web-components-open-source/create-a-salesforce-environment).

## Logout Variations

The logout functionality is implemented in 2 different ways

1. Logging out of the app, doesnt log you out of your active Salesforce session. The code for this is present in the `master` branch
1. Logging out of the app also logs you out of your active Salesforce session. The code for this is present in the `single-logout` branch.

## Using the app

1. Create a connected app in your Salesforce Org, and add `http://localhost:3001/oauth2/callback` to the list of Callback URLs.

1. Note the Consumer Key and Consumer Secret.

1. Clone this repository:

    ```
    git clone https://github.com/adityanaag3/lwc-oss-oauth
    cd lwc-oss-oauth
    ```

1. Create a `.env` file at the root of the project, and add the following code:

    ```
    SALESFORCE_LOGIN_DOMAIN='https://login.salesforce.com'
    SALESFORCE_CLIENT_ID='YOUR_SALESFORCE_CONSUMER_KEY'
    SALESFORCE_CLIENT_SECRET='YOUR_SALESFORCE_CONSUMER_SECRET'
    SALESFORCE_CALLBACK_URL='http://localhost:3001/oauth2/callback'
    NODE_SESSION_SECRET_KEY='SOME_RANDOM_SECRET_KEY'
    ```

1. Run `npm install`. (Refer to package.json for the dependencies that'll be installed)

1. Run `npm run watch`. This will start the project with a local development server.
