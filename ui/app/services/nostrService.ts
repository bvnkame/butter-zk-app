// FIX: Switched to a namespace import for `nostr-tools` to resolve the module loading error "does not provide an export named...". This is a common issue with how some libraries are bundled for CDN usage.
import * as nostrTools from 'nostr-tools';
import type { KeyPair, SignedEvent } from '../types';

// Helper functions for hex encoding/decoding, as nostr-tools operates on Uint8Arrays for private keys.
const bytesToHex = (bytes: Uint8Array): string => {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
};

const hexToBytes = (hex: string): Uint8Array => {
  if (hex.length % 2 !== 0) {
    throw new Error('Hex string must have an even number of characters.');
  }
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
};

export const nostrService = {
  generateKeys(): KeyPair {
    // FIX: Use the namespace object to access the library's functions.
    const privBytes = nostrTools.generateSecretKey();
    const priv = bytesToHex(privBytes);
    const pub = nostrTools.getPublicKey(privBytes);
    const npub = nostrTools.nip19.npubEncode(pub);
    return { priv, pub, npub };
  },

  signContent(privateKey: string, content: string): SignedEvent {
    const privateKeyBytes = hexToBytes(privateKey);
    // Although finalizeEvent can derive the pubkey, the UnsignedEvent type it expects requires it.
    const pubkey = nostrTools.getPublicKey(privateKeyBytes);

    const unsignedEvent = {
      kind: 1,
      created_at: Math.floor(Date.now() / 1000),
      tags: [],
      content: content,
      pubkey,
    };

    return nostrTools.finalizeEvent(unsignedEvent, privateKeyBytes);
  },

  npubEncode(pubkey: string): string {
    // FIX: Use the namespace object to access the library's functions.
    return nostrTools.nip19.npubEncode(pubkey);
  },
};
