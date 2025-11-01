

// FIX: Module '"firebase/auth"' has no exported member 'User'. Changed import from 'firebase/auth' to '@firebase/auth' to fix module resolution issues.
import type { User as FirebaseUser } from '@firebase/auth';
import type { Event as NostrEvent } from 'nostr-tools';

export type User = FirebaseUser | null;

export interface KeyPair {
  priv: string;
  pub: string;
  npub: string;
}

// FIX: Corrected SignedEvent interface to include required properties `id`, `pubkey`, and `sig` for a signed Nostr event. This fixes errors where these properties were not found.
export interface SignedEvent extends NostrEvent {
  id: string;
  pubkey: string;
  sig: string;
}

export interface Policies {
  [npub: string]: string;
}
