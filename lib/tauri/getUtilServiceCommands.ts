import { invoke } from "@tauri-apps/api/core";

interface UtilServiceCommands {
  /** Copy text to system clipboard */
  copyToClipboard: (text: string) => Promise<void>;
  /** Read an image file from disk and return a data URL for preview */
  readImageFileAsDataUrl: (path: string) => Promise<string>;
}

export default function getUtilServiceCommands(): UtilServiceCommands {
  return {
    copyToClipboard: (text) => invoke("copy_to_clipboard", { text }),
    readImageFileAsDataUrl: (path) =>
      invoke<string>("read_image_file_as_data_url", { path }),
  };
}
