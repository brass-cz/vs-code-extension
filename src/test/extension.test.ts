import * as assert from "assert";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import * as vscode from "vscode";

// Polls until the condition holds or the timeout elapses.
async function waitFor(
  condition: () => boolean,
  timeoutMs: number,
): Promise<boolean> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (condition()) {
      return true;
    }
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  return condition();
}

suite("Brass extension", () => {
  test("associates .cz files with the Brass language server", async function () {
    // Covers the whole chain: language contribution, activation event,
    // and the LSP round trip. Generous timeout for the server startup.
    this.timeout(60_000);

    // A syntactically broken file so the server must report a diagnostic.
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "brass-ext-test-"));
    const file = path.join(dir, "main.cz");
    fs.writeFileSync(file, "fun fun fun (((\n");

    const doc = await vscode.workspace.openTextDocument(file);
    await vscode.window.showTextDocument(doc);

    // The language contribution maps .cz to the brass language id.
    assert.strictEqual(doc.languageId, "brass");

    // Opening the file must fire the onLanguage:brass activation event.
    const ext = vscode.extensions.all.find((e) =>
      e.id.endsWith("brass-vs-code-extension"),
    );
    assert.ok(ext, "extension not found in the extension host");
    assert.ok(
      await waitFor(() => ext.isActive, 10_000),
      "extension did not activate on a .cz file",
    );

    // A diagnostic arriving proves the client actually talks to `czpm lsp`.
    assert.ok(
      await waitFor(
        () => vscode.languages.getDiagnostics(doc.uri).length > 0,
        30_000,
      ),
      "no diagnostics received from the language server",
    );
  });
});
