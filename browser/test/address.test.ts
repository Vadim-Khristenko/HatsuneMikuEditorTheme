import { describe, expect, test } from "bun:test";
import { hostKind, parseAddress } from "../src/address";
import { iconSrc, normalize, normalizeUrl } from "../src/settings";

describe("shortcut addresses", () => {
  test("public names get https, local hosts get http", () => {
    expect(parseAddress("github.com")).toBe("https://github.com/");
    expect(parseAddress("  vai-rice.space/blog  ")).toBe("https://vai-rice.space/blog");
    expect(parseAddress("localhost:3000")).toBe("http://localhost:3000/");
    expect(parseAddress("app.localhost")).toBe("http://app.localhost/");
    expect(parseAddress("192.168.1.1:8080/admin")).toBe("http://192.168.1.1:8080/admin");
    expect(parseAddress("::1")).toBe("http://[::1]/");
    expect(parseAddress("[fe80::1]:5173")).toBe("http://[fe80::1]:5173/");
  });

  test("custom zones and other scripts pass", () => {
    for (const a of ["nas.lan", "router.home.arpa", "git.internal", "пример.рф", "my_box.corp"]) expect(parseAddress(a)).not.toBeNull();
  });

  test("an explicit scheme is kept, only http and https", () => {
    expect(parseAddress("http://example.com")).toBe("http://example.com/");
    expect(parseAddress("ftp://example.com")).toBeNull();
    expect(parseAddress("javascript:alert(1)")).toBeNull();
    expect(parseAddress("file:///etc/passwd")).toBeNull();
  });

  test("things that cannot be a place fail", () => {
    for (const a of ["", "github", "miku tab", "1.2.3", "300.1.1.1", "999.999.999.999", "example..com", "-bad.com", "localhost:99999", "localhost:abc", "[zz::1]", "http://"]) {
      expect(parseAddress(a)).toBeNull();
    }
  });

  test("host kinds", () => {
    expect(hostKind("localhost")).toBe("localhost");
    expect(hostKind("10.0.0.1")).toBe("ipv4");
    expect(hostKind("[2001:db8::1]")).toBe("ipv6");
    expect(hostKind("miku.dev")).toBe("domain");
    expect(hostKind("miku")).toBeNull();
  });

  test("normalizeUrl reads host:port as a host, not a scheme", () => {
    expect(normalizeUrl("localhost:3000")).toBe("https://localhost:3000/");
  });
});

describe("shortcut pictures", () => {
  const png = "data:image/png;base64,iVBORw0KGgo=";

  test("uploads and links are kept, anything else is dropped", () => {
    expect(iconSrc(png)).toBe(png);
    expect(iconSrc("https://example.com/i.png")).toBe("https://example.com/i.png");
    expect(iconSrc("data:image/svg+xml;base64,PHN2Zz4=")).toBeNull();
    expect(iconSrc("data:text/html;base64,PGI+")).toBeNull();
    expect(iconSrc(`data:image/png;base64,${"A".repeat(300_000)}`)).toBeNull();
    expect(iconSrc("javascript:alert(1)")).toBeNull();
  });

  test("normalize keeps a picture and its fill only together", () => {
    const s = normalize({ shortcuts: [
      { id: "a", name: "A", url: "a.com", icon: png, fill: true },
      { id: "b", name: "B", url: "b.com", fill: true },
      { id: "c", name: "C", url: "c.com", icon: "nope" },
    ] });
    expect(s.shortcuts[0]).toEqual({ id: "a", name: "A", url: "https://a.com/", icon: png, fill: true });
    expect(s.shortcuts[1]).toEqual({ id: "b", name: "B", url: "https://b.com/" });
    expect(s.shortcuts[2]).toEqual({ id: "c", name: "C", url: "https://c.com/" });
  });
});
