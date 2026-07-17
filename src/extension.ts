import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";
import {
  Executable,
  LanguageClient,
  LanguageClientOptions,
} from "vscode-languageclient/node";

const INSTALL_GUIDE_URL = "https://brass-lang.cz/installation/quick/";

let client: LanguageClient | undefined;

// Resolves how to launch the server. `czpm lsp` enables package resolution
// only when its cwd contains a package.toml (and starts without resolution
// otherwise), so prefer the workspace folder that is a czpm package as cwd.
function serverOptions(): Executable {
  const config = vscode.workspace.getConfiguration("brass.server");
  const serverPath = config.get<string>("path", "");
  if (serverPath !== "") {
    return { command: serverPath, args: config.get<string[]>("args", []) };
  }

  const folders = (vscode.workspace.workspaceFolders ?? []).filter(
    (folder) => folder.uri.scheme === "file",
  );
  const packageRoot =
    folders.find((folder) =>
      fs.existsSync(path.join(folder.uri.fsPath, "package.toml")),
    ) ?? folders[0];
  return {
    command: "czpm",
    args: ["lsp"],
    options: packageRoot ? { cwd: packageRoot.uri.fsPath } : undefined,
  };
}

async function startClient(): Promise<void> {
  const server = serverOptions();
  const clientOptions: LanguageClientOptions = {
    documentSelector: [
      { scheme: "file", language: "brass" },
      { scheme: "untitled", language: "brass" },
    ],
  };

  // The client id "brass" ties the trace output to the
  // `brass.trace.server` setting contributed in package.json.
  client = new LanguageClient(
    "brass",
    "Brass Language Server",
    server,
    clientOptions,
  );

  try {
    await client.start();
  } catch {
    client = undefined;
    const selected = await vscode.window.showErrorMessage(
      `Failed to start the Brass language server (command: ${server.command}). ` +
        "Install the Brass toolchain or adjust the brass.server settings.",
      "Open install guide",
    );
    if (selected === "Open install guide") {
      await vscode.env.openExternal(vscode.Uri.parse(INSTALL_GUIDE_URL));
    }
  }
}

async function restartClient(): Promise<void> {
  if (client) {
    await client.stop();
    client = undefined;
  }
  await startClient();
}

export async function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand("brass.restartServer", restartClient),
    // Server settings only take effect on (re)start, so restart on change.
    vscode.workspace.onDidChangeConfiguration((event) => {
      if (event.affectsConfiguration("brass.server")) {
        void restartClient();
      }
    }),
  );

  await startClient();
}

export function deactivate(): Thenable<void> | undefined {
  return client?.stop();
}
