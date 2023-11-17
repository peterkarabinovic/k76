import { APIGatewayProxyEvent } from "aws-lambda";
import { calculateWordTypes } from "./word-types"


export async function handler(event: APIGatewayProxyEvent) {

    try {
        const { query = "" } = JSON.parse(event.body || "{}");
        return {
            statusCode: 200,
            body: JSON.stringify(calculateWordTypes(query))
        }
    }
    catch(err){
        if( err instanceof SyntaxError){
            return {
                statusCode: 400,
                body: JSON.stringify({ message: "Bad Request" })
            }
        }
        else {
            return {
                statusCode: 500,
                body: JSON.stringify({ message: "Internal Server Error" })
            }
        }
    }

};



