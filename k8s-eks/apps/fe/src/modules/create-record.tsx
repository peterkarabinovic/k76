import Link from "next/link";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import * as T from "../types";
import * as R from "../requests";

type CreateRecordProps = {
  error?: string;
  onCreate: (r: T.Record) => Promise<void>;
};

export function CreateRecordView({ error, onCreate }: CreateRecordProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  return (
    <div>
      <h1>Create New Record</h1>
      <form onSubmit={() => onCreate({ id: 0, name, description}) }>
        <label>
          Name:
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>
        <br />
        <label>
          Description:
          <textarea
            rows={10}
            style={{height: "auto"}} 
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </label>
        <br />
        <button type="submit">Create Record</button>
      </form>
      <br />
      <Link href="/">
        Back to Records List
      </Link>
    </div>
  );
}

export function CreatePage() {
  const [error, setError] = useState<string>();
  const { push } = useRouter();

  const handleCreate = async (r: T.Record) => {
    let res = await R.createRecord(r);
    if (!res.isOk) {
      setError(res.error);
    } 
    else {
        push("/")
    }    
  };

  return <CreateRecordView error={error} onCreate={handleCreate} />;
}
