import multer, { Options } from "multer";
import crypto from "node:crypto";
import path from "node:path";

const TMP_FOLDER = path.resolve(__dirname, "..", "..", "tmp");
const UPLOADS_FOLDER = path.resolve(__dirname, "..", "..", "uploads");

const MAX_SIZE = 3; // 3MB
const MAX_FILE_SIZE = 1024 * 1024 * MAX_SIZE;

const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png"];

const MULTER: Options = {
  storage: multer.diskStorage({
    destination: TMP_FOLDER,
    filename: (req, file, callback) => {
      const fileHash = crypto.randomBytes(10).toString("hex");
      const filename = `${fileHash}-${file.originalname}`;
      return callback(null, filename);
    },
  }),
};

export default {
  TMP_FOLDER,
  UPLOADS_FOLDER,
  MAX_SIZE,
  MAX_FILE_SIZE,
  ACCEPTED_IMAGE_TYPES,
  MULTER,
};
