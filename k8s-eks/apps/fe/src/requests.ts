import axios from "axios"
import * as T from "./types"

const axiosInstance = axios.create({
    baseURL: process.env.API_URL,
    headers:{
        "content-type": "application/json"
    }
});

type QueryResult<T> = 
    | { isOk: true, data: T }
    | { isOk: false,  error: string }

export async function fetchRecords(): Promise<QueryResult<T.Record[]>> {
    const res = await axiosInstance.request({
        method: "GET",
        url: "/records"
    });

    if(res.status == 200) {
        return { isOk: true, data: res.data}
    }
    else {
        return { isOk: false, error: res.statusText }
    }
}

export async function deleteRecord(id: number): Promise<QueryResult<void>> {
    const res = await axiosInstance.request({
        method: "DELETE",
        url: `/records/${id}`
    });

    if(res.status < 400) {
        return { isOk: true, data: undefined }
    }
    else {
        return { isOk: false, error: res.statusText }
    }    
}

export async function createRecord(record: Omit<T.Record, "id">) {
    const res = await axiosInstance.request({
        method: "POST",
        url: `/records`,
        data: record
    });

    if(res.status < 400) {
        return { isOk: true, data: undefined }
    }
    else {
        return { isOk: false, error: res.statusText }
    }        
    
}