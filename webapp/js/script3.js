function isPrime(num, k = 5) {
    if (num <= 1n) return false;
    if (num <= 3n) return true;

    // Write (num - 1) as 2^s * d
    let s = 0n;
    let d = num - 1n;
    while (d % 2n === 0n) {
        s++;
        d /= 2n;
    }

    const witness = (a, n) => {
        if (a <= 1n || a >= n - 1n) return false;

        let x = mod_exp(a, d, n);
        if (x === 1n || x === n - 1n) return false;

        for (let i = 1n; i < s; i++) {
            x = mod_exp(x, 2n, n);
            if (x === n - 1n) return false;
        }

        return true;
    };

    for (let i = 0; i < k; i++) {
        const a = getRandomBigInt(2n, num - 1n);
        if (witness(a, num)) return false;
    }

    return true;
}

function getRandomBigInt(min, max) {
    const range = max - min + 1n;
    const random = BigInt(Math.floor(Math.random() * Number(range)));
    return min + random;
}

function generateRandomBigInt(minDigits, maxDigits) {
    if (minDigits < 1 || maxDigits < minDigits) {
      throw new Error('Invalid digit range');
    }
    const randomDigits = Array.from({ length: Math.floor(Math.random() * (maxDigits - minDigits + 1)) + minDigits }, () =>
      Math.floor(Math.random() * 10)
    ).join('');
    const randomBigInt = BigInt(randomDigits);
    return randomBigInt;
}

function generatePrimeWithDigits(min, max) {
    while (true){
        let primeCandidate = generateRandomBigInt(min, max);
        
        if (primeCandidate % 2n === 0) {
            primeCandidate++;
        }

        if (isPrime(primeCandidate)) {
            return primeCandidate;
        }
    }
}

function mod_exp(base, exponent, modulus) {
    if (modulus === 1n) return 0n;
    let result = 1n;
    base = base % modulus;
    while (exponent > 0n) {
        if (exponent % 2n === 1n) {
            result = (result * base) % modulus;
        }
        exponent = exponent >> 1n;
        base = (base * base) % modulus;
    }
    return result;
}
function modExp(a, b, n) {
    a = BigInt(a);
    b = BigInt(b);
    n = BigInt(n);

    let result = BigInt(1);
    a = a % n;

    while (b > 0n) {
        if (b % 2n === 1n) {
            result = (result * a) % n;
        }
        a = (a * a) % n;
        b = b / 2n;
    }

    return result;
}
function gcd(a, b) {
    return b === 0n ? a : gcd(b, a % b);
}

function lcm(a, b) {
    return (a * b) / gcd(a, b);
}

function extendedGCD(a, b) {
    if (b === 0n) {
        return [a, 1n, 0n];
    } else {
        const [d, x, y] = extendedGCD(b, a % b);
        return [d, y, x - y * (a / b)];
    }
}

function multiplicativeInverse(a, n) {
    const [g, x, y] = extendedGCD(a, n);

    if (g !== 1n) {
        throw new Error("Inverse does not exist");
    }

    return (x % n + n) % n;
}

function textToLong(text) {
    const encoder = new TextEncoder();
    const textBytes = encoder.encode(text);
    const textLong = BigInt('0x' + Array.from(textBytes).map(byte => byte.toString(16).padStart(2, '0')).join(''));
    return textLong;
}

function longToText(longMsg) {
    const hexString = longMsg.toString(16).padStart((longMsg.toString(16).length + 1) & ~1, '0');
    const hexArray = hexString.match(/.{2}/g);
    
    if (!hexArray) {
        throw new Error('Invalid hex string');
    }

    const bytes = Uint8Array.from(hexArray.map(byte => parseInt(byte, 16)));
    const decoder = new TextDecoder('utf-8');
    return decoder.decode(bytes);
}

function divmod(a, b) {
    const quotient = a / b;
    const remainder = a % b;
    return [quotient, remainder];
}

function generateTwoPrimesWithDigits(min, max) {
    const prime1 = generatePrimeWithDigits(min, max);
    console.log("Prime 1 : ",prime1);
    const prime2 = generatePrimeWithDigits(min, max);
    console.log("Prime 2 : ",prime2);
    return{prime1, prime2}
}

function generate_random_g(n,lamda){
    let gcd1 = 0;
    let n_square = n ** 2n;
    const numberOfDigits = n_square.toString().length;
    let g = 1n;
    while (gcd!==1n){
        g = generateRandomBigInt(2, numberOfDigits-1);
        const temp = mod_exp(g, lamda, n_square);
        const temp1 = temp - 1n;
        const [quotient, remainder] = divmod(temp1, n);
        gcd1 = gcd(quotient, n);
        if (remainder!==0n){
          gcd1 = 0;
        }
        if (gcd1===1n){
          break;
        }
    }
    return(g);
}

function check_g(g, n, lamda){
    let n_square = n * n;
    const temp = mod_exp(g, lamda, n_square);
    const temp1 = temp - 1n;
    const [quotient, remainder] = divmod(temp1, n);
    gcd1 = gcd(quotient, n);
    if (gcd1===1n){
    return true
    }
    else{
        return false
    }
}

function check_r(r, n){
    let gcd1 = gcd(r, n);
    if (gcd1 === 1n){
        return true
    }
    else{
        return false
    }
}

function encrypt(n,g,r,plaintext) {
    let n_squared = n * n;
    let temp = modExp(g, plaintext, n_squared);
    let temp1 = modExp(r, n, n_squared);
    let ciphertext = (temp * temp1) % n_squared;
    return(ciphertext);
}

function decrypt(n,lamda,mu,cipherhex){
    let n_squared = n * n;
    let temp = modExp(cipherhex,lamda,n_squared);
    temp = temp - 1n;
    const [quotient, remainder] = divmod(temp, n);
    if (remainder !== 0n) {
        throw new Error("Something went wrong");
    }
    let plain_long = (quotient*mu)%n;
    return(plain_long);
}

let n,g,lamda,mu,r;

function generateKeys() {
    let possible_p = BigInt(document.getElementById('primeP').value);
    let possible_q = BigInt(document.getElementById('primeQ').value);
    let g = BigInt(document.getElementById('generatorG').value);
    let r = BigInt(document.getElementById('randomR').value);
    
    if(!isPrime(possible_p) || !isPrime(possible_q)){
        alert("Composite number entered at primes!!");
        document.getElementById('primeP').value = '';
        document.getElementById('primeQ').value = '';
        document.getElementById('generatorG').value = '';
        document.getElementById('randomR').value = '';
    }
    else{
        let n = possible_p * possible_q;
        const lamda = lcm(possible_p - 1n, possible_q - 1n);
        if(!check_g(g, n, lamda)){
            alert("G value is not valid!!");
            document.getElementById('primeP').value = '';
            document.getElementById('primeQ').value = '';
            document.getElementById('generatorG').value = '';
            document.getElementById('randomR').value = '';
        }
        else if(!check_r(r, n)){
            alert("R value is valid!!!");
            document.getElementById('randomR').value = '';
        }
        else{
            const n_squared = n ** 2n;
            const temp = mod_exp(g, lamda, n_squared);
            const temp1 = temp - 1n;
            const [quotient, remainder] = divmod(temp1, n);
            if (remainder !== 0n) {
                throw new Error("Something went wrong");
            }
            const mu = multiplicativeInverse(quotient, n);

            return[n,g,lamda,mu, r];
        }
    }
}

document.getElementById('genkeys').addEventListener('click', async function () {
    try {
        [n, g, lamda, mu, r] = generateKeys();

        const keysOutput = `
            <p>Public Key (n, g): (${n}, ${g})</p>
            <p>Private Key (lambda, mu): (${lamda}, ${mu})</p>
        `;

        document.getElementById('keysOutput').innerHTML = keysOutput;
    } catch (error) {
        console.error(error);
        document.getElementById('keysOutput').innerHTML = '<p>Error generating keys</p>';
    }
});

document.getElementById('enc').addEventListener('click', async function () {
    const plaintext = document.getElementById('plaintext').value;
    const ciphertext = await encrypt(n,g,r,plaintext);
    document.getElementById('encryptionOutput').innerHTML = `
        <p>Ciphertext: ${ciphertext}</p>
    `;
    document.getElementById('ciphertext').value= ciphertext
});

document.getElementById('dec').addEventListener('click', async function () {
    const ciphertext = document.getElementById('ciphertext').value;
    const plaintext = await decrypt(n,lamda,mu,ciphertext);
    document.getElementById('decryptionOutput').innerHTML = `
        <p>Plaintext: ${plaintext}</p>
    `;
});