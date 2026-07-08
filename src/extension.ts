import * as vscode from "vscode";
import { LanguageClient, Executable, TransportKind } from "vscode-languageclient/node";

let client: LanguageClient | undefined;

export function activate(_context: vscode.ExtensionContext) {
  const lspExec: Executable = {
    command: "ppm",
    args: ["lsp"],
    transport: TransportKind.stdio,
  };

  client = new LanguageClient(
    "prepolyLanguageServer",
    "prepoly Language Server",
    lspExec,
    { documentSelector: [{ pattern: "*.pp" }] },
  );

  client.start();
}

// This method is called when your extension is deactivated
export function deactivate() {
  if (client) {
    client.stop();
  }
}
