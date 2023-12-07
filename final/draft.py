import random

def is_prime(n, k=5):
    if n <= 1:
        return False
    if n <= 3:
        return True
    if n % 2 == 0:
        return False

    # Miller-Rabin primality test
    def miller_rabin(n, d, r):
        a = random.randint(2, n - 2)
        x = mod_exp(a, d, n)
        if x == 1 or x == n - 1:
            return True
        for i in range(r - 1):
            x = mod_exp(x, 2, n)
            if x == n - 1:
                return True
        return False

    d, r = n - 1, 0
    while d % 2 == 0:
        d //= 2
        r += 1

    for i in range(k):
        if not miller_rabin(n, d, r):
            return False

    return True

def generate_strong_prime(bits):
    while True:
        potential_prime = random.getrandbits(bits)
        if potential_prime % 2 == 0:
            potential_prime += 1
        if is_prime(potential_prime):
            return potential_prime
        
def gcd(a, b):
    while b:
        a, b = b, a % b
    return a

def lcm(a, b):
    return (a * b) // gcd(a, b)

def extended_gcd(a, b):
    x0, x1, y0, y1 = 1, 0, 0, 1
    while b != 0:
        q, r = divmod(a, b)
        a, b = b, r
        x0, x1 = x1, x0 - q * x1
        y0, y1 = y1, y0 - q * y1
    return a, x0, y0

def multiplicative_inverse(a, n):
    gcd, x, y = extended_gcd(a, n)
    if gcd != 1:
        raise ValueError(f"The multiplicative inverse does not exist for {a} (mod {n}).")
    else:
        return x % n
    
def mod_exp(a, b, n):
    result = 1
    a = a % n

    while b > 0:
        if b % 2 == 1:
            result = (result * a) % n

        a = (a * a) % n
        b //= 2

    return result

def text_to_long(text):
    text_bytes = text.encode('utf-8')
    text_long = int.from_bytes(text_bytes, byteorder='big')
    return(text_long)

def long_to_text(long_msg):
    text_bytes = long_msg.to_bytes((long_msg.bit_length() + 7) // 8, byteorder='big')
    text = text_bytes.decode('utf-8')
    return(text)

def generate_keys():
    bits = 1024
    p = generate_strong_prime(bits)
    q = generate_strong_prime(bits)

    n = p*q
    g = 1+n
    lamda = lcm((p-1),(q-1))

    n_squared = n**2
    temp = mod_exp(g, lamda, n_squared)
    temp1 = temp-1
    quotient, remainder = divmod(temp1, n)
    if (remainder!=0):
        raise ValueError(f"Something went wrong")

    mu = multiplicative_inverse(quotient, n)
    
    public_key = [n, g]
    private_key = [lamda, mu]
    
    return(public_key, private_key)

def encrypt_msg(msg, public_key):
    msg_long = text_to_long(msg)
    n = public_key[0]
    g = public_key[1]
    
    def select_r(n):
        while True:
            r = random.randint(0, n)
            if gcd(r, n) == 1:
                return r
    
    r = select_r(n)
    n_squared = n**2
    temp = mod_exp(g, msg_long, n_squared)
    temp1 = mod_exp(r, n, n_squared)
    cipher_text = (temp*temp1)%n_squared
    return(cipher_text)

def decrypt_msg(cipher_text, public_key, private_key):
    lamda = private_key[0]
    mu = private_key[1]
    n = public_key[0]
    n_squared = n**2
    temp = mod_exp(cipher_text, lamda, n_squared)
    temp = temp - 1
    quotient, remainder = divmod(temp, n)
    if (remainder!=0):
        raise ValueError(f"Something went wrong")
    plain_long = (quotient*mu)%n        
    plain_text = long_to_text(plain_long)
    return(plain_text)

print("Generating Keys.....................")
print()
public_key, private_key = generate_keys()
print("n value : ", public_key[0])
print()
print("g value : ", public_key[1])
print()
print("Encryption:")
msg = input("Enter your plain text >> ")
plain_long = text_to_long(msg)
print("Plain text in long : ", plain_long)
cipher_text = encrypt_msg(msg, public_key)
cipher_hex = hex(cipher_text)
print("Cipher_text : ", cipher_hex)
print()
print("Decryption:")
plain_text_back = decrypt_msg(cipher_text, public_key, private_key)
print("Plain_text : ", plain_text_back)
print("Print Any Key to Exit.........")
input()
