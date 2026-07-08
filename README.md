# prepoly VS Code Extension

VS Code extension for [the prepoly programming language](https://prepoly.56.ax/) and its language server.

The prepoly programming language can be written like a scripting language without type annotation
while its program is always type checked.

## Getting started

You can learn how to write prepoly on [the user guide](https://prepoly.56.ax/guides/hello/).

Before using this extension, you have to install the prepoly toolchain.
Please refer to [Quick start](https://prepoly.56.ax/installation/quick/).

The extension activates on `.pp` files and starts the language server with
`ppm lsp` from your PATH. When a workspace folder contains a `package.toml`,
the server runs from that folder with package resolution; otherwise it runs
in single-file mode. To use a different binary (e.g. a locally built
`prepoly-lsp`), set:

```jsonc
{
  "prepoly.server.path": "/path/to/prepoly-lsp",
  "prepoly.server.args": []
}
```

Use the `prepoly: Restart Language Server` command to restart the server;
changing the `prepoly.server` settings restarts it automatically.
