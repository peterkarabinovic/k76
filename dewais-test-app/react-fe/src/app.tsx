import React, { useState } from 'react';
import AppView from './app-view';

function App() {

  const [result, setResult] = useState({kino: 1} as any);
  const [error, setError] = useState(undefined);  

  const request = async (query: string) => {

    fetch("/api", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ query })
    })
    .then(res => res.json())
    .then(json => { 
        setResult(json) 
        setError(undefined)
    })
    .catch(err => setError(err.message) );
  }  

  return (
    <AppView initQuery="Hello" results={result} error={error} onSubmit={request} />
  );
}

export default App;
