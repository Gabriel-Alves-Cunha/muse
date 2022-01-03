# Muse

<h1 align="center">
	<img src="src/renderer/assets/icons/logo_with_name.svg" alt="logo">
</h1>

> Just a simple Electron-React app to download audio from Youtube and play them.

## Table of contents

<!--ts-->

- [Layout](#Layout)
- [Tecnologies](#Tecnologies)
- [Requirements](#Requirements)
- [Installing](#Installing)
- [Contributing](#Contributing)
- [Author](#Author)
- [License](#License)
<!--te-->

<h4 align="center">
	🚧  React - Electron 🚀 Building...  🚧
</h4>

## Screenshots

<h1 align="center">
  <img src="images/Screenshot from 2021-12-18 18-38-42.png" />
</h1>

<h1 align="center">
  <img src="images/Screenshot from 2021-12-18 18-39-21.png" />
</h1>

<!-- ## Features

- [x] Companies or entities can register on the web platform by sending:

  - [x] an image of the collection point
  - [x] entity name, email and whatsapp
  - [x] and the address so that it can appear on the map
  - [x] in addition to selecting one or more collection items:
    - lamps
    - Batteries
    - papers and cardboard
    - electronic waste
    - organic waste
    - kitchen oil

- [x] Users have access to the mobile application, where they can:
  - [x] browse the map to see the registered institutions
  - [x] contact the entity via E-mail or WhatsApp -->

### 🛠 Tecnologies

The following tools were used on this project construction:

- [Vite](https://vitejs.dev/)
- [Node.js](https://nodejs.org/en/)
- [React](https://pt-br.reactjs.org/)
- [Electron](https://www.electronjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Axios](https://github.com/axios/axios)
- [React Icons](https://react-icons.github.io/react-icons/)
- [Chokidar](https://github.com/paulmillr/chokidar)
- [Emotion](https://github.com/emotion-js/emotion)
- [ffmpeg](https://github.com/fluent-ffmpeg/node-fluent-ffmpeg)
- [Why Did You Render](https://github.com/welldone-software/why-did-you-render)

## 💻 Requirements

Before everything, verify that:

- You have the most recent (LTS) version of `git`, `Node.JS` and `yarn || npm`

## 🚀 Installing

To install and run Muse, follow these steps:

```bash
git clone https://github.com/Gabriel-Alves-Cunha/muse
yarn
```

```bash
yarn dev
```

Start local development

```shell
# Use esbuild to compile the main process Typescript, which is faster
yarn run dev

# Use tsc to compile the main process Typescript
yarn run dev:tsc
```

You can also use `dev:main`, `dev:main:tsc`, and `dev:renderer` separately to debug the main process and the rendering process separately.

Compile/Pack

```shell
# Only build the target code and resources of the main process and the rendering process, without packaging (exe, dmg, etc.)
yarn run build

# Preview your application in production mode without pack.
yarn run preview

# Build and pack as a runnable program or installer
yarn run pack:win
yarn run pack:mac
yarn run pack:linux

# Pack for all platforms
yarn run pack # Exclude mac platform, applicable to linux & win
yarn run pack:all
```

Clean up the build directory

```shell
yarn run clean
```

The electron project stater using vite for renderer process and esbuild / tsc for main process.

React demo with antd is available here (Automatic style introduction has been configured. Vite supports on-demand loading by default): [antd branch](https://github.com/jctaoo/electron-starter/tree/antd)

Note: CSC_IDENTITY_AUTO_DISCOVERY is set to false by default to avoid the codesign operation in packaging macos (learn more: [codesign](https://www.electron.build/code-signing))

## 📫 Contributing

To contribute with Muse, follow these steps:

1. Fork this repo.
2. Create a branch: `git checkout -b <my_branch_name>`.
3. Make your alterations e confirm them: `git commit -am '<commit_message>'`
4. Send to the original branch: `git push origin <my_branch_name>`
5. Create a pull request.

As an alternative, consult the docs from GitHub on [how to create a pull request](https://help.github.com/en/github/collaborating-with-issues-and-pull-requests/creating-a-pull-request).

### Author

---

<a href="https://github.com/Gabriel-Alves-Cunha/">
 <img style="border-radius: 50%;" src="https://github.com/Gabriel-Alves-Cunha.png" width="100px;" alt=""/>
 <br />
 <sub><b>Gabriel Alves Cunha</b></sub></a> <a href="https://blog.rocketseat.com.br/author/thiago//" title="Rocketseat">🚀</a>

Made with ❤️ by Gabriel Alves Cunha 👋🏽!

[![Linkedin Badge](https://img.shields.io/badge/-Gabriel-blue?style=flat-square&logo=Linkedin&logoColor=white&link=https://www.linkedin.com/in/gabriel-alves-cunha-214178174/)](https://www.linkedin.com/in/gabriel-alves-cunha-214178174/)
[![Gmail Badge](https://img.shields.io/badge/-gabriel925486@gmail.com-c14438?style=flat-square&logo=Gmail&logoColor=white&link=mailto:gabriel925486@gmail.com)](mailto:gabriel925486@gmail.com)

## 📝 License

This project is under the MIT license. See the [LICENCE](LICENCE) for more details.
