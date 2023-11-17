import React, { useState } from "react";
import "./app-view.css";

type Props = {
  initQuery: string;
  results: Record<string, number>;
  error?: string;
  onSubmit: (query: string) => void;
};

export default function AppView({ initQuery, results, error, onSubmit }: Props) {

  const [query, setQuery] = useState(initQuery);  
  
  const onFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit(query);
  }

  return <>
    <form className="app-form" onSubmit={onFormSubmit}>
      <fieldset>
        <label htmlFor="query">Input Text</label>
        <input id="query" type="text"  value={query} onChange={e => setQuery(e.target.value)}></input>
        <label htmlFor="Result">Result</label>
        <textarea id="Result" 
            rows={10} 
            readOnly={true} 
            style={{height: "auto"}} 
            value={Object.entries(results).map(([key, value]) => `${key}: ${value}`).join('\n')}/>
        { error && <div className="error">{error}</div> }
        <div className="float-right">
          <input className="button-primary" type="submit" value="Submit"/>
        </div>
      </fieldset>
    </form>
  </>;
}
