// Codifica/decodifica payloads pequenos de mensagens em URL (sem backend).
// Usa base64url para ser amigável em URLs e mensageiros.

export interface SharedPayload {
  t: string; // texto
  r: string; // referência
  n?: string; // nome de quem enviou (opcional)
  c?: string; // categoria
}

function b64urlEncode(input: string): string {
  // btoa só lida com latin1; codifica utf-8 antes
  const utf8 = unescape(encodeURIComponent(input));
  return btoa(utf8)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function b64urlDecode(input: string): string {
  const pad = input.length % 4 === 0 ? "" : "=".repeat(4 - (input.length % 4));
  const b64 = input.replace(/-/g, "+").replace(/_/g, "/") + pad;
  return decodeURIComponent(escape(atob(b64)));
}

export function encodeSharedPayload(p: SharedPayload): string {
  return b64urlEncode(JSON.stringify(p));
}

export function decodeSharedPayload(s: string): SharedPayload | null {
  try {
    const obj = JSON.parse(b64urlDecode(s));
    if (obj && typeof obj.t === "string" && typeof obj.r === "string") {
      return obj as SharedPayload;
    }
    return null;
  } catch {
    return null;
  }
}

export function buildShareUrl(p: SharedPayload): string {
  return `https://chosen.oonn.com.br/p/${encodeSharedPayload(p)}`;
}