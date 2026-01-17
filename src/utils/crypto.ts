/**
 * Mobile-grade Zero-Knowledge Crypto Utility
 * Uses Web Crypto API for hardware-accelerated encryption
 */

const ITERATIONS = 100000;
const ALGO = 'AES-GCM';

async function deriveKey(passcode: string, salt: Uint8Array) {
    const encoder = new TextEncoder();
    const baseKey = await crypto.subtle.importKey(
        'raw',
        encoder.encode(passcode),
        'PBKDF2',
        false,
        ['deriveKey']
    );

    return crypto.subtle.deriveKey(
        {
            name: 'PBKDF2',
            salt: salt as BufferSource,
            iterations: ITERATIONS,
            hash: 'SHA-256',
        },
        baseKey,
        { name: ALGO, length: 256 },
        false,
        ['encrypt', 'decrypt']
    );
}

export async function encryptData(text: string, passcode: string): Promise<string> {
    if (!text || !passcode) return text;

    const encoder = new TextEncoder();
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const key = await deriveKey(passcode, salt);

    const encrypted = await crypto.subtle.encrypt(
        { name: ALGO, iv },
        key,
        encoder.encode(text)
    );

    const combined = new Uint8Array(salt.length + iv.length + encrypted.byteLength);
    combined.set(salt, 0);
    combined.set(iv, salt.length);
    combined.set(new Uint8Array(encrypted), salt.length + iv.length);

    return btoa(String.fromCharCode(...combined));
}

export async function decryptData(encoded: string, passcode: string): Promise<string> {
    if (!encoded || !passcode) return encoded;

    try {
        const combined = new Uint8Array(
            atob(encoded).split('').map(char => char.charCodeAt(0))
        );

        const salt = combined.slice(0, 16);
        const iv = combined.slice(16, 28);
        const data = combined.slice(28);

        const key = await deriveKey(passcode, salt);
        const decrypted = await crypto.subtle.decrypt(
            { name: ALGO, iv },
            key,
            data
        );

        return new TextDecoder().decode(decrypted);
    } catch (e) {
        // If decryption fails, it might be an old unencrypted entry
        // We return original text to "not fuck up" old data
        console.warn('ZK Decryption failed, returning raw data');
        return encoded;
    }
}
