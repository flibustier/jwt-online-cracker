<div align=center>
    <h1>
    <img src="https://github.com/user-attachments/assets/e93900d2-3fbb-4724-8d26-69659f2c5994" alt="JWT Online Cracker" />
    </h1>
</div>

Brute-force HS256, HS384 or HS512 JWT Token from your browser. Using exclusively 100% **client-side** JavaScript. No installation needed.

<div align=center>
<a href="https://jwt.cracking.ovh">jwt.cracking.ovh</a> 
</div>

Demo :

https://github.com/user-attachments/assets/61c2abd2-5832-433a-bc92-54411db8860e

Made with [Vue 3](https://vuejs.org) (TypeScript, 0 dependency) using web workers and a futuristic looking UI.

Contributions are welcome!

> Update 04-2025 : The domain has changed from [jwt-cracker.online](https://jwt.cracking.ovh) to [jwt.cracking.ovh](https://jwt.cracking.ovh) 

## Features

- [x] HS256, HS384, HS512
- [x] Bruteforcing with custom character set
- [x] Bruteforcing with custom length
- [x] Dictionary attack with a [preset of lists](https://github.com/danielmiessler/SecLists)
- [ ] Custom dictionary ([#1](https://github.com/flibustier/jwt-online-cracker/issues/1))
- [ ] Timer and other statistics
- [ ] Bruteforcing using webassembly ([#2](https://github.com/flibustier/jwt-online-cracker/issues/2))
- [ ] Notification when finished ([#3](https://github.com/flibustier/jwt-online-cracker/issues/3))

## Running locally

### Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur) + [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin).

### Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin) to make the TypeScript language service aware of `.vue` types.

If the standalone TypeScript plugin doesn't feel fast enough to you, Volar has also implemented a [Take Over Mode](https://github.com/johnsoncodehk/volar/discussions/471#discussioncomment-1361669) that is more performant. You can enable it by the following steps:

1. Disable the built-in TypeScript Extension
   1. Run `Extensions: Show Built-in Extensions` from VSCode's command palette
   2. Find `TypeScript and JavaScript Language Features`, right click and select `Disable (Workspace)`
2. Reload the VSCode window by running `Developer: Reload Window` from the command palette.

### Customize configuration

See [Vite Configuration Reference](https://vitejs.dev/config/).

### Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Type-Check, Compile and Minify for Production

```sh
npm run build
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```
