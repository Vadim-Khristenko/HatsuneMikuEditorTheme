// A primitive check that a typed shortcut address could point somewhere, not a full URL grammar.
// Hosts that pass: localhost (and *.localhost), IPv4, IPv6, and name.zone with any zone,
// because people run their own zones (.lan, .home.arpa, .internal and so on).

export type HostKind = "localhost" | "ipv4" | "ipv6" | "domain";

const IPV4 = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
const LABEL = /^[\p{L}\p{N}](?:[\p{L}\p{N}_-]{0,61}[\p{L}\p{N}])?$/u;

function isIpv6(s: string): boolean {
  if (!/^[0-9a-f:.]+$/i.test(s) || !s.includes(":")) return false;
  try {
    new URL(`http://[${s}]/`);
    return true;
  } catch {
    return false;
  }
}

export function hostKind(host: string): HostKind | null {
  const h = host.toLowerCase().replace(/\.$/, "");
  if (!h || h.length > 253) return null;
  if (h.startsWith("[")) return h.endsWith("]") && isIpv6(h.slice(1, -1)) ? "ipv6" : null;
  const v4 = IPV4.exec(h);
  if (v4) return v4.slice(1).every((o) => Number(o) <= 255) ? "ipv4" : null;
  // Digits and dots that are not four octets (1.2.3, 300.1.1.1) are a typo, not a name.
  if (/^[\d.]+$/.test(h)) return null;
  const labels = h.split(".");
  if (!labels.every((l) => LABEL.test(l))) return null;
  if (labels[labels.length - 1] === "localhost") return "localhost";
  return labels.length >= 2 ? "domain" : null;
}

/** The address as a full http(s) URL, or null when it cannot be one. */
export function parseAddress(input: string): string | null {
  let s = input.trim();
  if (!s || /\s/.test(s)) return null;
  // A bare IPv6 address (::1, fe80::1) gets the brackets a URL needs.
  if (isIpv6(s)) s = `[${s}]`;
  const scheme = /^([a-z][a-z0-9+.-]*):\/\//i.exec(s);
  if (scheme && !/^https?$/i.test(scheme[1])) return null;
  const rest = scheme ? s.slice(scheme[0].length) : s;
  const authority = rest.split(/[/?#]/)[0];
  const hostPort = authority.slice(authority.lastIndexOf("@") + 1);
  const host = hostPort.startsWith("[") ? hostPort.slice(0, hostPort.indexOf("]") + 1) : hostPort.replace(/:\d{1,5}$/, "");
  const kind = hostKind(host);
  if (!kind) return null;
  // Local servers rarely have certificates, public sites nearly always do.
  const full = scheme ? s : `${kind === "domain" ? "https" : "http"}://${s}`;
  try {
    const u = new URL(full);
    return u.protocol === "http:" || u.protocol === "https:" ? u.href : null;
  } catch {
    return null;
  }
}
