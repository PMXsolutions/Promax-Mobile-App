#!/usr/bin/env python3
"""Print the SHA-1 of the first APK v2/v3 signer certificate.

The fingerprint is a public signing identifier. This does not verify the
signature cryptographically; it reads the certificate embedded in the APK
signing block so a build can be compared with the Maps restriction.
"""

import hashlib
import sys

V2_SCHEME_ID = 0x7109871A
V3_SCHEME_ID = 0xF05368C0
MAGIC = b"APK Sig Block 42"


def u32(buf, offset):
    return int.from_bytes(buf[offset : offset + 4], "little"), offset + 4


def u64(buf, offset):
    return int.from_bytes(buf[offset : offset + 8], "little"), offset + 8


def first_certificate(scheme_value):
    signers_len, offset = u32(scheme_value, 0)
    signers = scheme_value[offset : offset + signers_len]
    signer_len, offset = u32(signers, 0)
    signer = signers[offset : offset + signer_len]
    signed_len, offset = u32(signer, 0)
    signed = signer[offset : offset + signed_len]
    digests_len, offset = u32(signed, 0)
    offset += digests_len
    certs_len, offset = u32(signed, offset)
    certs = signed[offset : offset + certs_len]
    cert_len, offset = u32(certs, 0)
    return certs[offset : offset + cert_len]


def signing_pairs(apk):
    eocd = apk.rfind(b"PK\x05\x06")
    if eocd < 0:
        raise ValueError("ZIP end of central directory was not found.")
    central_offset = int.from_bytes(apk[eocd + 16 : eocd + 20], "little")
    if apk[central_offset - 16 : central_offset] != MAGIC:
        raise ValueError("APK signing block magic was not found.")
    size = int.from_bytes(apk[central_offset - 24 : central_offset - 16], "little")
    block_start = central_offset - size - 8
    size_again = int.from_bytes(apk[block_start : block_start + 8], "little")
    if size_again != size:
        raise ValueError("APK signing block size does not match.")
    pairs = apk[block_start + 8 : central_offset - 24]
    offset = 0
    found = {}
    while offset + 12 <= len(pairs):
        pair_len, offset = u64(pairs, offset)
        pair = pairs[offset : offset + pair_len]
        offset += pair_len
        scheme_id = int.from_bytes(pair[:4], "little")
        if scheme_id in (V2_SCHEME_ID, V3_SCHEME_ID):
            found[scheme_id] = pair[4:]
    return found


def certificate_sha1(path):
    with open(path, "rb") as handle:
        apk = handle.read()
    pairs = signing_pairs(apk)
    scheme = pairs.get(V2_SCHEME_ID) or pairs.get(V3_SCHEME_ID)
    if scheme is None:
        raise ValueError("APK has no v2 or v3 signer certificate.")
    digest = hashlib.sha1(first_certificate(scheme)).hexdigest().upper()
    return ":".join(digest[index : index + 2] for index in range(0, len(digest), 2))


def main():
    if len(sys.argv) not in (2, 3):
        print("Usage: apk-cert-sha1.py <apk> [expected-sha1]", file=sys.stderr)
        return 2
    actual = certificate_sha1(sys.argv[1])
    print(actual)
    if len(sys.argv) == 3:
        expected = sys.argv[2].strip().upper()
        if actual != expected:
            print(f"Signing SHA-1 {actual} does not match {expected}.", file=sys.stderr)
            return 1
        print("Signing SHA-1 matches the company validation fingerprint.")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as error:
        print(str(error), file=sys.stderr)
        raise SystemExit(1)
