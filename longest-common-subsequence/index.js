// Description: solving Longest Common Subsequence with dynamic programming.
// with two approaches:
// 1. Tabulation - Bottom-up approach
// 2. Memoization - Up-Down approach



// 1. Tabulation - Bottom-up approach
class Cell {
    constructor(sequence, length){
        this.sequence = sequence;
        this.length = length;
    }
    toString() {
        return `sequence: ${this.sequence}, length: ${this.length}`;
    }
}

function lcs(str1, str2) {
    if(str1.length === 0 || str2.length === 0) 
        return "";

    const NULL_CELL = new Cell("", 0);
    let matrix = new Array(str1.length ).fill().map(() => new Array(str2.length).fill(NULL_CELL));   
    
    for(let i = 0; i < str1.length; i++) {
        for(let j=0; j < str2.length; j++) {
            if(str1[i] === str2[j]) {
                let leter = str1[i];
                let prev = i > 0 && j > 0 && matrix[i-1][j-1] || NULL_CELL;
                matrix[i][j] = new Cell(prev.sequence + leter, prev.length + 1);
            }
            else {
                let prev1 = i > 0 && matrix[i-1][j] || NULL_CELL;
                let prev2 = j > 0 && matrix[i][j-1] || NULL_CELL;
                matrix[i][j] = prev1.length > prev2.length ? prev1 : prev2;
            }
        }
    }
    console.log(matrix)
    return matrix[str1.length - 1][str2.length - 1].sequence;
}
// log(lcs, "ABAZDC", "BACBAD"); // ABAD
// log(lcs, "ABAZDC", "BACABA"); // ABA
// log(lcs, "ABCD", "ACDF"); // ACD
// log(lcs, "AFBAF", "ABSFAF"); // AFAF
// log(lcs, "AFBAF", "ABSFAFBAF"); // AFBAF
log(lcs, "ABSFAFBAF", "AFBAF"); // AFBAF

console.log("--------------------------")



// 2. Memoization - Up-Down approach
function memoize(fn){
    let cache = {};
    return function(...args){
        let key = args.join(",")
        if(cache[key]) {
            return cache[key];
        }
        let result = fn.apply(this, args);
        cache[key] = result;
        return result;
    }
}

function lcs2(str1, str2){
    if(str1.length === 0 || str2.length === 0) 
        return "";
    if(str1[0] === str2[0]) {
        return str1[0] + lcs2(str1.slice(1), str2.slice(1));
    }
    let result1 = lcs2(str1.slice(1), str2);
    let result2 = lcs2(str1, str2.slice(1));
    return result1.length > result2.length ? result1 : result2; 
}
lcs2 = memoize(lcs2);


log(lcs2, "ABAZDC", "BACBAD"); // ABAD
log(lcs2, "ABAZDC", "BACABA"); // ABA
log(lcs2, "ABCD", "ACDF"); // ACD
log(lcs2, "AFBAF", "ABSFAF"); // AFAF
console.log("--------------------------")
 

// from https://reintech.io/blog/solving-longest-common-subsequence-problem-in-javascript
function lcs3(X, Y) {
    let m = X.length;
    let n = Y.length;
    let L = Array(m+1).fill().map(() => Array(n+1).fill(0));

    for (let i=0; i<=m; i++) {
        for (let j=0; j<=n; j++) {
            if (i == 0 || j == 0) {
                L[i][j] = 0;
            } else if (X[i-1] == Y[j-1]) {
                L[i][j] = L[i-1][j-1] + 1;
            } else {
                L[i][j] = Math.max(L[i-1][j], L[i][j-1]);
            }
        }
    }
    return L[m][n];
}
log(lcs3, "ABAZDC", "BACBAD"); // 4
log(lcs3, "ABAZDC", "BACABA"); // 3
log(lcs3, "ABCD", "ACDF"); // 3
log(lcs3, "AFBAF", "ABSFAF"); // 4

function log(fn, str1, str2){
    console.log( ` ${fn.name}("${str1}", "${str2}") => ${fn(str1, str2)}`);
}