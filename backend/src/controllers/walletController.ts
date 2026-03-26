import { Response } from "express";
import Wallet from "./../models/Wallet.js";
import { AuthRequest } from "./../middleware/auth.js";
import User from "../models/User.js";

const getCurrentUser = async (req: AuthRequest) => {
  const userEmail = req.user?.email;

  if (!userEmail) {
    return null;
  }

  return User.findOne({ email: userEmail }).select("_id email");
};


//  Connect wallet
export const connectWallet = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { address } = req.body as { address?: string };

    const user = await getCurrentUser(req);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    if (!address || typeof address !== "string") {
      res.status(400).json({ message: "Wallet address is required" });
      return;
    }

    const normalizedAddress = address.trim().toLowerCase();
    const isWalletAddressValid = /^0x[a-f0-9]{40}$/.test(normalizedAddress);

    if (!isWalletAddressValid) {
      res.status(400).json({ message: "Invalid wallet address format" });
      return;
    }

    // check trùng ví
    const exist = await Wallet.findOne({ address: normalizedAddress });
    if (exist) {
      if (String(exist.userId) === String(user._id)) {
        res.status(200).json({
          message: "Wallet already linked to this account",
          wallet: exist,
        });
        return;
      }

      res.status(409).json({ message: "Wallet already linked to another account" });
      return;
    }

    const walletCount = await Wallet.countDocuments({ userId: user._id });

    const wallet = await Wallet.create({
      userId: user._id,
      address: normalizedAddress,
      isPrimary: walletCount === 0,
    });

    res.status(201).json({
      message: "Wallet connected successfully",
      wallet,
    });

  } catch (error) {
    res.status(500).json({ message: "Error connect wallet", error });
  }
};


// 📥 Get wallets của user
export const getMyWallets = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const wallets = await Wallet.find({ userId: user._id })
      .sort({ isPrimary: -1, createdAt: -1 });

    res.json({ wallets });

  } catch (error) {
    res.status(500).json({ message: "Error get wallets", error });
  }
};


//  Set primary wallet
export const setPrimaryWallet = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { walletId } = req.params;

    const user = await getCurrentUser(req);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // reset tất cả về false
    await Wallet.updateMany(
      { userId: user._id },
      { isPrimary: false }
    );

    const wallet = await Wallet.findOneAndUpdate(
      { _id: walletId, userId: user._id },
      { isPrimary: true },
      { returnDocument: 'after' }
    );

    if (!wallet) {
      res.status(404).json({ message: "Wallet not found" });
      return;
    }

    res.json({ message: "Primary wallet updated", wallet });

  } catch (error) {
    res.status(500).json({ message: "Error set primary", error });
  }
};


//  Delete wallet
export const deleteWallet = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { walletId } = req.params;

    const user = await getCurrentUser(req);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const deletedWallet = await Wallet.findOneAndDelete({
      _id: walletId,
      userId: user._id
    });

    if (!deletedWallet) {
      res.status(404).json({ message: "Wallet not found" });
      return;
    }

    if (deletedWallet.isPrimary) {
      const newestWallet = await Wallet.findOne({ userId: user._id })
        .sort({ createdAt: -1 });

      if (newestWallet) {
        newestWallet.isPrimary = true;
        await newestWallet.save();
      }
    }

    res.json({ message: "Wallet deleted" });

  } catch (error) {
    res.status(500).json({ message: "Error delete wallet", error });
  }
};