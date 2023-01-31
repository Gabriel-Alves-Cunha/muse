import { appWindow } from "@tauri-apps/api/window";

export const toggleMaximize = () => appWindow.toggleMaximize().then();

/////////////////////////////////////////////

export const minimizeWindow = () => appWindow.minimize().then();

/////////////////////////////////////////////

export const closeWindow = () => appWindow.close().then();

/////////////////////////////////////////////

// export const reloadWindow = () => appWindow.
