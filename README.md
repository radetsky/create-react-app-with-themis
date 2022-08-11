# Getting Started with Create React App and Themis

## New project

### Project initialization
```
npx create-react-app my-project
cd my-project
```

### Adding Themis and development dependencies
```
npm install react-app-rewired --save-dev
npm install copy-webpack-plugin --save-dev
npm install wasm-themis --save
npm install buffer --save
```

### Configure webpack
Copy override-config.js from this example to root of your project. Webpack configuration placed in `node-modules/react-scripts/config`
```
/* override-config.js */

const fs = require('fs');
const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const CWD_PATH = fs.realpathSync(process.cwd());
const buildPath = process.env.BUILD_PATH || 'build';
const resolveApp = relativePath => path.resolve(CWD_PATH, relativePath);
const OUTPUT_PATH = resolveApp(buildPath);

const NODE_MODULES_PATH = path.join(CWD_PATH, 'node_modules');
const WASM_PATH = path.join(NODE_MODULES_PATH, 'wasm-themis/src/libthemis.wasm');
const SCRIPTS_PATH = path.join(OUTPUT_PATH, 'static/js/');

module.exports = function override(config, env) {
    if (!config.plugins) {
        config.plugins = [];
    }

    /* Copying libthemis.wasm to the folder where javascript bundles will be places in any configuration: development or production */
    config.plugins.push(
        new CopyWebpackPlugin({ patterns: [{ from: WASM_PATH, to: SCRIPTS_PATH }] })
    );

    /* Special config for Themis as described in documentation. */
    config['resolve']['fallback'] = {
        crypto: false,
        fs: false,
        http: false,
        https: false,
        net: false,
        path: false,
        stream: false,
        tls: false,
        util: false,
        url: false,
        zlib: false,
    }

    return config;
}
```
If you need more complex configuration you may read the documentation to react-app-rewired: https://github.com/timarney/react-app-rewired

Modify package.json in section scripts:
```
"scripts": {
    "start": "react-app-rewired start",
    "build": "react-app-rewired build",
    "test": "react-app-rewired test",
```

### Run
`npm start`
### Build
`npm run build`

## Add Themis to existing React Project

### With Webpack
When you are using dedicated webpack and it's config placed in the root of your project like `webpack.config.js`, you may just add the content of override-config.js to own configuration. Do not forget to install copy-webpack-plugin as development dependency.

### With built-in webpack in create-react-app config
Add react-app-rewired and other dependencies to your project
```
npm install react-app-rewired --save-dev
npm install copy-webpack-plugin --save-dev
npm install wasm-themis --save
npm install buffer --save
```

Copy content of config-override.js to your own config-override.js if it already exists. If not just copy the file.
And modify package.json scripts section as described below.

## Run the Themis

### Run this example without modifications
`npm start`

Your browser will redirected to localhost:3000 and you should see content like this:
```
Your symmetric key is: GLJ0XNDAEifli9G3V3uw4YwXrs042WVk2/dLhUMml5I=

Your encrypted message is: AAEBQAwAAAAQAAAAJgAAAM3i4EpktjjiH98oVp3D7PAdOC+vPy8CJG+tMzu+OdGgHWTgUh84OiKX+HVL3MrBtbX1qhjWedhcYsD/Qt2N2k2YGQ==

Your decrypted message is: Hello Cryptographic World with Themis!
```

If you can see it - well! it is done!
If not then try to open developer console and find the error message.  Something wrong.

### Run Themis from scratch
Previously we added the development and run dependencies to the project. Next, import Themis and try to initialize it.


```
import { Buffer } from 'buffer';
import { initialize, SymmetricKey, SecureCellSeal } from 'wasm-themis';

function App() {

  // Similar to componentDidMount and componentDidUpdate:
  useEffect(() => {
    initialize().then(() => {
      const symKey = new SymmetricKey();
      // It is safe too to store base64 encoded strings and convenient to display
      const symKey64 = Buffer.from(symKey).toString('base64');
    }).catch(err => {
      // console.error(err);
      // Themis initialization must be only once.
    })
  }, []);
```

### Using symmetric key to encrypt data
```
    // Create cell
    const cell = SecureCellSeal.withKey(symKey);
    // Converting plaintext data to Uint8Array because Themis works with bytes.
    const contextForThemis = 'Example Context';
    const helloWorld = 'Hello Cryptographic World with Themis!';
    const context = new Uint8Array(Buffer.from(contextForThemis));
    const plaintext = new Uint8Array(Buffer.from(helloWorld));
    // Encryption magic returns Uint8Array
    const encryptedBytes = cell.encrypt(plaintext, context);
    // Encode it to convenient display or store to a storage
    encrypted64 = Buffer.from(encryptedBytes).toString('base64');
```

### Using symmetric key to decrypt data

```
    // Create cell
    const cell = SecureCellSeal.withKey(symKey);
    // Converting plaintext data to Uint8Array because Themis works with bytes.
    const contextForThemis = 'Example Context';
    const context = new Uint8Array(Buffer.from(contextForThemis));

    // Decryption magic return Uint8Array
    // EncryptedBytes we declare early.
    const decryptedBytes = cell.decrypt(encryptedBytes, context);

    // Convert to readable string
    const decryptedStr = Buffer.from(decryptedBytes).toString('utf8')
```

Please refer to original documentation for Themis - https://docs.cossacklabs.com/themis/languages/wasm/features/


