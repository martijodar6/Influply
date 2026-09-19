// Shared helpers for the "proof of control" identity-verification flow
// (creators prove they own their social handle, businesses prove their
// listing is real) — see src/db/schema.ts for why we don't collect ID
// documents.

// Excludes visually-ambiguous characters (0/O, 1/I/L) since this code is
// meant to be read out of a photo or typed by hand.
const CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

export function generateVerificationCode(length = 6): string {
  let code = '';
  for (let i = 0; i < length; i += 1) {
    code += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
  }
  return code;
}

// The Influply account creators are asked to DM/comment their code to, and
// the one companies are told to check against a business's own channels.
// Swap this for the real handle before relying on this flow in production.
export const VERIFICATION_CONTACT_HANDLE = '@influply.app';
