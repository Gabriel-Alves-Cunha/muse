# Muse

<h1 align="center">
	<img src="src/renderer/assets/icons/logo_with_name.svg" alt="Muse's logo, a donut-like circle with shades of blue.">
</h1>

> Just a simple Electron-React app to download audio from YouTube and play them.

## Table of contents

- [Layout](#Layout)
- [Tecnologies](#Tecnologies)
- [Features](#Features)
- [Installing](#Installing)
- [Requirements](#Requirements)
- [Contributing](#Contributing)
- [Author](#Author)
- [License](#License)

## Screenshots

<h1 align="center">
  <img src="screenshots/home.png" alt="Muse's home page wich is divide in three main parts, from left to right: the navigation, the main, wich contains the media list, and the media player." />
</h1>

<h1 align="center">
  <img src="screenshots/download.png" alt="Muse's download page." />
</h1>

### 🛠 Tecnologies

The following tools were used on this project construction:

- [Vite](https://vitejs.dev/)
- [Vitest](https://vitest.dev/)
- [Stitches](https://stitches.dev/)
- [Radix UI](https://radix-ui.com/)
- [Node.js](https://nodejs.org/en/)
- [React](https://pt-br.reactjs.org/)
- [Electron](https://www.electronjs.org/)
- [Zustand](https://github.com/pmndrs/zustand)
- [TypeScript](https://www.typescriptlang.org/)
- [Ytdl Core](https://github.com/fent/node-ytdl-core)
- [React Icons](https://react-icons.github.io/react-icons/)
- [Node TagLib Sharp](https://github.com/benrr101/node-taglib-sharp)
- [Fluent ffmpeg](https://github.com/fluent-ffmpeg/node-fluent-ffmpeg)

## Features

* Copy an URL and see a message asking if you want to download
an 'mp3' version of the media.

* Share medias with devices on the same WiFi network.

* Get a media's lyrics.

## 🚀 Installing

To install and run Muse, follow these steps:

* Linux  
  Download 'Muse-***version***.AppImage' from the releases page;
  Once downloaded, you need to make it an executable. On your terminal, run: `chmod a+x Muse-*.AppImage`.
  Now you can run Muse: `./Muse-*.AppImage`

## Develop

To install and run Muse, follow these steps:

```bash
git clone https://github.com/Gabriel-Alves-Cunha/muse --depth 1
```

```bash
# Install dependencies
yarn
```


```bash
# Start app:
yarn dev
```

## 💻 Requirements

For development, before everything, verify that:

- You have the most recent (LTS) version of `git`, `Node.JS` and `yarn`

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
  <img
    alt="Gabriel Alves Cunha Github's profile picture."
    src="https://github.com/Gabriel-Alves-Cunha.png"
    style="border-radius: 50%;"
    width="100px"
  />

  <br />

  <sub>
    <b>Gabriel Alves Cunha</b>
  </sub>
</a>

<a href="https://blog.rocketseat.com.br/author/thiago//" title="Rocketseat">🚀</a>

Made with ❤️ by Gabriel Alves Cunha 👋🏽!

[![Linkedin Badge](https://img.shields.io/badge/-Gabriel-blue?style=flat-square&logo=Linkedin&logoColor=white&link=https://www.linkedin.com/in/gabriel-alves-cunha-214178174/)](https://www.linkedin.com/in/gabriel-alves-cunha-214178174/)
[![Gmail Badge](https://img.shields.io/badge/-gabriel925486@gmail.com-c14438?style=flat-square&logo=Gmail&logoColor=white&link=mailto:gabriel925486@gmail.com)](mailto:gabriel925486@gmail.com)

## 📝 License

This project is under the MIT license. See the [LICENCE](LICENCE) for more details.
