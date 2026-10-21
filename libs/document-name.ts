export function documentNameForSubmit(
  docName: string,
  otherName: string
): { ok: true; name: string } | { ok: false; message: string } {
  const selected = docName.trim();
  if (!selected) {
    return {
      ok: false,
      message: "Please select or enter a document name",
    };
  }

  if (selected.toLowerCase() === "others") {
    const other = otherName.trim();
    if (!other) {
      return {
        ok: false,
        message: "Enter a name for the other document.",
      };
    }
    return { ok: true, name: other };
  }

  return { ok: true, name: selected };
}
