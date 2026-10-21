import fs from "fs";
import path from "path";

const read = (relativePath: string) =>
  fs.readFileSync(path.join(__dirname, "..", relativePath), "utf8");

describe("profile and document keyboard taps", () => {
  it("lets those form buttons receive a tap while the keyboard is open", () => {
    for (const file of [
      "modules/profile/edit-profile-form.tsx",
      "modules/profile/edit-emergency-form.tsx",
      "modules/profile/edit-otherinfo-form.tsx",
      "modules/document/add-document-form.tsx",
      "modules/document/edit-document-form.tsx",
    ]) {
      expect(read(file)).toContain('keyboardShouldPersistTaps="handled"');
    }
  });
});
