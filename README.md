## Overview

The following describe how to run the sample code of the In-app Chat UIKit.

## Prepare the environment

Before you begin, make sure your environment meets the following:
- Chrome 58 or later.
- Node.js 14.18.1 or later
- The device is connected to the internet.

## Prerequisites

- Go to [ZEGOCLOUD Admin Console\|_blank](https://console.zegocloud.com/) and do the following:
    1.  Create a project, and get the `AppID` and `ServerSecret` of your project. 
    2.  Subscribe the **In-app Chat** service.

## Run the sample code (React)

### Sample code directory structure

```bash
├── README.md                     # README file
├── package.json
├── public
├── src
│   ├── pages                     # Business component directory
│   ├── store                     # Business state management
│   ├── util                      # Utilities
│   ├── ZIMKit                    # In-app Chat UIKit SDK
│   ├── index.jsx                 # Project entry file
│   ├── config.js                 # SDK config file
├── tsconfig.json                 # ts config file
```

### Run the sample code

1. Download the sample code, open the `config.js` file under the src`` folder, and fill in the AppID and ServerSecret you get from the ZEGOCLOUD Admin Console.
If you generate the Token using your own server, fill in the method that used to generate the Token in the `tokenURL`.

   ```javascript
   const appConfig = {
     appID: 0,        // Fill in the App ID you get. 
     serverSecret: '' // Run the ServerSecret you get.
     tokenURL: ''     // Your API method that used to generate Tokens.
   };
   ```

2. Run the following code in order to run the sample code.

```bash
    npm install # Install dependencies.
    npm start   # After installing the dependencies, execute this to run the project. 
```
