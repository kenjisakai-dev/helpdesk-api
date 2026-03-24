import fs from "node:fs";
import path from "node:path";
import uploadConfig from "@/configs/multer-config";

export class DiskStorage {
  async saveFile(filename: string) {
    const tmpPath = path.resolve(uploadConfig.TMP_FOLDER, filename);
    const destPath = path.resolve(uploadConfig.UPLOADS_FOLDER, filename);

    try {
      await fs.promises.access(tmpPath);
    } catch (err) {
      throw new Error(`Arquivo não encontrado: ${tmpPath}`);
    }

    await fs.promises.mkdir(uploadConfig.UPLOADS_FOLDER, { recursive: true });
    await fs.promises.rename(tmpPath, destPath);

    return filename;
  }

  async deleteFile(filename: string, folder: "tmp" | "uploads") {
    const pathfile =
      folder === "tmp" ? uploadConfig.TMP_FOLDER : uploadConfig.UPLOADS_FOLDER;

    const filepath = path.resolve(pathfile, filename);

    try {
      await fs.promises.stat(filepath);
    } catch (err) {
      return;
    }

    await fs.promises.unlink(filepath);
  }
}
