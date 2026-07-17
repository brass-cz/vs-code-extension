# Brass VS Code Extension

VS Code extension for [the Brass programming language](https://brass-lang.cz/) and its language server.

The Brass programming language can be written like a scripting language without type annotation
while its program is always type checked.

## Getting started

You can learn how to write Brass on [the user guide](https://brass-lang.cz/guides/hello/).

Before using this extension, you have to install the Brass toolchain.
Please refer to [Quick start](https://brass-lang.cz/installation/quick/).

The extension activates on `.cz` files and starts the language server with
`czpm lsp` from your PATH. When a workspace folder contains a `package.toml`,
the server runs from that folder with package resolution; otherwise it runs
in single-file mode. To use a different binary (e.g. a locally built
`czls`), set:

```jsonc
{
  "brass.server.path": "/path/to/czls",
  "brass.server.args": []
}
```

Use the `Brass: Restart Language Server` command to restart the server;
changing the `brass.server` settings restarts it automatically.
