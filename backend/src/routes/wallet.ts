import express from "express";
import {
  connectWallet,
  getMyWallets,
  setPrimaryWallet,
  deleteWallet
} from "./../controllers/walletController.js";
import { verifyInternalRequest } from "../middleware/auth.js";

const router = express.Router();

router.post("/connect", verifyInternalRequest, connectWallet);

router.get("/", verifyInternalRequest, getMyWallets);

router.patch("/primary/:walletId", verifyInternalRequest, setPrimaryWallet);

router.delete("/:walletId", verifyInternalRequest, deleteWallet);

export default router;