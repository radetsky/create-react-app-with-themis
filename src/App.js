import logo from './logo.svg';
import './App.css';
import React, { useState, useEffect } from 'react';
import { Buffer } from 'buffer';

import { initialize, SymmetricKey, SecureCellSeal } from 'wasm-themis';

function App() {
  const contextForThemis = 'Example Context';
  const helloWorld = 'Hello Cryptographic World with Themis!';

  const [symKey, setSymKey] = useState(null);
  const [encrypted, setEncrypted] = useState(null);
  const [decrypted, setDecrypted] = useState(null);

  // Similar to componentDidMount and componentDidUpdate:
  useEffect(() => {
    // Update the document title using the browser API
    document.title = `Welcome to Themis example React app!`;
    initialize().then(() => {
      const symKey = new SymmetricKey();
      // It is safe to store the base64 encoded key in the browser's local storage or in a database.
      // reverse operation is Uint8Array(Buffer.from(symKey64, 'base64'))
      const symKey64 = Buffer.from(symKey).toString('base64');
      console.log(symKey64);
      setSymKey(symKey64);

      const cell = SecureCellSeal.withKey(symKey);
      const context = new Uint8Array(Buffer.from(contextForThemis));
      const plaintext = new Uint8Array(Buffer.from(helloWorld));
      const encryptedBytes = cell.encrypt(plaintext, context);
      setEncrypted(Buffer.from(encryptedBytes).toString('base64'));
      const decryptedBytes = cell.decrypt(encryptedBytes, context);
      const decryptedStr = Buffer.from(decryptedBytes).toString('utf8')
      setDecrypted(decryptedStr);

    }).catch(err => {
      // console.error(err);
      // Themis initialization must be only once.
    })
  }, []);


  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          View <code>src/App.js</code> and <code>README.md</code> to get example how to use Themis with React.
        </p>
        <a
          className="App-link"
          href="https://docs.cossacklabs.com/themis/languages/wasm/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn Themis
        </a>
        <p>
          {symKey ? <>Your symmetric key is: <code>{symKey}</code></> : <>Loading...</>}
        </p>
        <p>
          {encrypted ? <>Your encrypted message is: <code>{encrypted}</code></> : <>Loading...</>}
        </p>
        <p>
          {decrypted ? <>Your decrypted message is: <code>{decrypted}</code></> : <>Loading...</>}
        </p>
      </header>
    </div>
  );
}

export default App;
