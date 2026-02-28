import { Router } from "express";
import multer from "multer";
import uploadConfig from "@/configs/multer-config";
import { UploadService } from "@/services/uploads-services";
import { UploadController } from "@/controllers/uploads-controllers";
import { DiskStorage } from "@/providers/disk-storage";

const uploadsRoutes = Router();
const diskStorage = new DiskStorage();
const uploadsService = new UploadService(diskStorage);
const uploadsController = new UploadController(uploadsService);

const upload = multer(uploadConfig.MULTER);

uploadsRoutes.post("/", upload.single("profile"), uploadsController.create);

export { uploadsRoutes };
