import {
  isAuthSessionExpired,
  mapAuthFailure,
  readJwtExpiryMs,
} from "@/utils/auth-session";

const baseUser = {
  userId: "u1",
  firstName: "A",
  lastName: "B",
  email: "a@b.c",
  phoneNumber: "",
  fullName: "A B",
  role: "Staff",
  companyId: 1,
};

/** Minimal unsigned JWT with exp claim (client parse only). */
const jwtWithExp = (expSeconds: number) => {
  const header = Buffer.from(JSON.stringify({ alg: "none", typ: "JWT" })).toString(
    "base64url"
  );
  const payload = Buffer.from(JSON.stringify({ exp: expSeconds })).toString(
    "base64url"
  );
  return `${header}.${payload}.sig`;
};

describe("isAuthSessionExpired", () => {
  it("treats missing token/user as expired", () => {
    expect(isAuthSessionExpired(null, null)).toBe(true);
    expect(isAuthSessionExpired(null, "tok")).toBe(true);
  });

  it("requires reauthentication when tokenExpiration is missing/empty and JWT has no exp", () => {
    expect(
      isAuthSessionExpired({ ...baseUser, tokenExpiration: "" }, "not-a-jwt")
    ).toBe(true);
  });

  it("treats malformed tokenExpiration as expired when JWT also lacks exp", () => {
    expect(
      isAuthSessionExpired(
        { ...baseUser, tokenExpiration: "not-a-date" },
        "not-a-jwt"
      )
    ).toBe(true);
  });

  it("expires when tokenExpiration is in the past", () => {
    expect(
      isAuthSessionExpired(
        { ...baseUser, tokenExpiration: "2020-01-01T00:00:00.000Z" },
        "tok"
      )
    ).toBe(true);
  });

  it("accepts future tokenExpiration", () => {
    expect(
      isAuthSessionExpired(
        { ...baseUser, tokenExpiration: "2099-01-01T00:00:00.000Z" },
        "tok"
      )
    ).toBe(false);
  });

  it("falls back to JWT exp when tokenExpiration missing", () => {
    const future = Math.floor(Date.now() / 1000) + 3600;
    const past = Math.floor(Date.now() / 1000) - 10;
    expect(
      isAuthSessionExpired({ ...baseUser, tokenExpiration: "" }, jwtWithExp(future))
    ).toBe(false);
    expect(
      isAuthSessionExpired({ ...baseUser, tokenExpiration: "" }, jwtWithExp(past))
    ).toBe(true);
  });

  it("readJwtExpiryMs returns null for garbage", () => {
    expect(readJwtExpiryMs(null)).toBeNull();
    expect(readJwtExpiryMs("abc")).toBeNull();
  });
});

describe("Wave-11B session failure classification", () => {
  it("maps reuse to revoked", () => {
    expect(mapAuthFailure(401, "reuse_detected")).toBe("revoked");
  });

  it("maps 403 to tenant_denied without logout semantics", () => {
    expect(mapAuthFailure(403)).toBe("tenant_denied");
  });

  it("maps missing status to network", () => {
    expect(mapAuthFailure(undefined)).toBe("network");
  });
});
