import fs from "fs";
import path from "path";

const read = (relativePath: string) =>
  fs.readFileSync(path.join(__dirname, "..", relativePath), "utf8");

describe("report keyboard taps", () => {
  it("lets the report buttons receive a tap while the keyboard is open", () => {
    for (const file of [
      "modules/report/add-report-form.tsx",
      "modules/report/edit-report-form.tsx",
    ]) {
      expect(read(file)).toContain('keyboardShouldPersistTaps="handled"');
    }
  });
});
