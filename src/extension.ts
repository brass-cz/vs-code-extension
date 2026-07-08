import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";
import {
  Executable,
  LanguageClient,
  LanguageClientOptions,
} from "vscode-languageclient/node";

const INSTALL_GUIDE_URL = "https://prepoly.56.ax/installation/quick/";

let client: LanguageClient | undefined;

// Resolves how to launch the server. `ppm lsp` enables package resolution
// only when its cwd contains a package.toml (and starts without resolution
// otherwise), so prefer the workspace folder that is a ppm package as cwd.
function serverOptions(): Executable {
  const config = vscode.workspace.getConfiguration("prepoly.server");
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
    command: "ppm",
    args: ["lsp"],
    options: packageRoot ? { cwd: packageRoot.uri.fsPath } : undefined,
  };
}

async function startClient(): Promise<void> {
  const server = serverOptions();
  const clientOptions: LanguageClientOptions = {
    documentSelector: [
      { scheme: "file", language: "prepoly" },
      { scheme: "untitled", language: "prepoly" },
    ],
  };

  // The client id "prepoly" ties the trace output to the
  // `prepoly.trace.server` setting contributed in package.json.
  client = new LanguageClient(
    "prepoly",
    "prepoly Language Server",
    server,
    clientOptions,
  );

  try {
    await client.start();
  } catch {
    client = undefined;
    const selected = await vscode.window.showErrorMessage(
      `Failed to start the prepoly language server (command: ${server.command}). ` +
        "Install the prepoly toolchain or adjust the prepoly.server settings.",
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
    vscode.commands.registerCommand("prepoly.restartServer", restartClient),
    // Server settings only take effect on (re)start, so restart on change.
    vscode.workspace.onDidChangeConfiguration((event) => {
      if (event.affectsConfiguration("prepoly.server")) {
        void restartClient();
      }
    }),
  );

  await startClient();
}

export function deactivate(): Thenable<void> | undefined {
  return client?.stop();
}
