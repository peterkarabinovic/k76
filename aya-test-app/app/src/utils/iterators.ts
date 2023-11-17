
export async function  *bufferIterator<T>(iter: AsyncIterable<T>, bufferSize: number): AsyncIterable<T[]> {
    let buffer: T[] = [];
    for await (let item of iter) {
        buffer.push(item);
        if(buffer.length === bufferSize) {
            yield buffer;
            buffer = [];
        }
    }
    if(buffer.length > 0) {
        yield buffer;
    }
} 