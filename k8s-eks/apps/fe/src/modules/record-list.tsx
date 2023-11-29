import Link from 'next/link';
import { useState, useEffect } from "react"
import * as T from "../types"
import * as R from "../requests"


type RecordListProps = {
    records: T.Record[],
    error?: string,
    onDelete: (id: number) => Promise<void>
}

export function RecordListView({records, onDelete}: RecordListProps){

    return (
        <div className='center'>
          <h1>Records List</h1>
          <table>
            <thead>
                <tr>
                    <th>Name</th>
                    <th colSpan={3}>Description</th>
                    <th></th>
                </tr>
            </thead>
            <tbody>
                {records.map((record) => (
                    <tr key={record.id}>
                        <td>{record.name}</td>
                        <td>{record.description}</td>
                        <td>
                            <button onClick={() => onDelete(record.id)}>Delete</button>
                        </td>
                    </tr>
                ))}
            </tbody>
          </table>
          <Link href="/create">
            Create New Record
          </Link>
        </div>
      );
    
}

export function RecordListPage() {

    const [records, setRecords] = useState<T.Record[]>([]);
    const [error, setError] = useState<string>();

    const handleDelete = async (id: number) => {
        let res = await R.deleteRecord(id);
        if(!res.isOk) {
            setError(res.error);
        }
        else
            setRecords( records.filter( r => r.id === id) );
    };

    useEffect( () => {
        R.fetchRecords()
            .then( res => {
                if(res.isOk) {
                    setRecords(res.data);
                }
                else {
                    setError(res.error);
                }
            });
      }, [records]);
    
    return <RecordListView records={records} onDelete={handleDelete}/>
}


