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
      console.log("Themis initialized");
      const symKey = new SymmetricKey(); // Ready to use symmetric key
      const symKey64 = Buffer.from(symKey).toString('base64'); // safe to print and store in any storage
      // reverse operation is Uint8Array(Buffer.from(symKey64, 'base64'))
      console.log(symKey64);
      setSymKey(symKey64);
      const cell = SecureCellSeal.withKey(symKey);
      const context = new Uint8Array(Buffer.from(contextForThemis));
      const plaintext = new Uint8Array(Buffer.from(helloWorld));
      const encryptedBytes = cell.encrypt(plaintext, context);
      setEncrypted(Buffer.from(encryptedBytes).toString('base64'));
      const decryptedBytes = cell.decrypt(encryptedBytes, context);
      const decryptedStr = Buffer.from(decryptedBytes).toString('utf8');
      setDecrypted(decryptedStr);
    }).catch(err => {
      // console.error(err);
      // Themis initialization must be only once.
    });
  }, []);

  const encryptFile = (event) => {
    if (event === undefined || event === null) {
      return;
    }

    console.log("encryptFile event:", event);
    const file = event.target.files[0];

    const reader = new FileReader();
    reader.readAsArrayBuffer(file);

    reader.onload = () => {
      const bytes = reader.result;
      console.log("bytes:", bytes);
      const symKey = new SymmetricKey(); // Ready to use symmetric key
      const cell = SecureCellSeal.withKey(symKey);
      const context = new Uint8Array(Buffer.from(contextForThemis));
      const encryptedBytes = cell.encrypt(bytes, context);
      console.log("encryptedBytes length:", encryptedBytes.length);
      const decryptedBytes = cell.decrypt(encryptedBytes, context);
      console.log("decryptedBytes length:", decryptedBytes.length);
    };

    reader.onerror = () => {
      console.log(reader.error);
    };
  };

  return (
    <div className="App">
      <header className="App-header">
        <img src={ logo } className="App-logo" alt="logo" />
        <form>
          <input name="file" type="file" id="file" onChange={ (event) => { encryptFile(event); } } />
        </form>
      </header>
    </div>
  );
};

export default App;
