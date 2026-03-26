import { Request, Response } from 'express';
import User from '../models/User.js';
import { generateJWT } from '../middleware/auth.js';
import { AuthRequest } from '../middleware/auth.js';

export const syncUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, name, avatar, provider, providerId } = req.body;

        if (!email || !provider || !providerId) {
            res.status(400).json({ message: 'Missing required fields' });
            return;
        }

        // Tìm hoặc tạo user
        let user = await User.findOne({ email });

        if (!user) {
            // Tạo user mới nếu chưa tồn tại
            user = new User({
                email,
                name,
                avatar,
                provider,
                providerId,
            });
        } else {
            // Cập nhật thông tin nếu user đã tồn tại
            user.name = name || user.name;
            user.avatar = avatar || user.avatar;
            user.provider = provider;
            user.providerId = providerId;
        }

        await user.save();

        // Tạo JWT token
        const token = generateJWT({
            id: user._id,
            email: user.email,
            name: user.name,
        });

        res.status(200).json({
            message: 'User synced successfully',
            user,
            token, // Trả token về cho frontend
        });
    } catch (error) {
        console.error('Error syncing user:', error);
        res.status(500).json({ message: 'Error syncing user', error });
    }
};

export const getUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email } = req.query;

        if (!email) {
            res.status(400).json({ message: 'Email is required' });
            return;
        }

        const user = await User.findOne({ email });

        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        res.status(200).json(user);
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ message: 'Error fetching user', error });
    }
};

export const getMyWallet = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const email = req.user?.email;

        if (!email) {
            res.status(401).json({ message: 'Missing user context' });
            return;
        }

        const user = await User.findOne({ email }).select('email walletAddress');

        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        res.status(200).json({
            email: user.email,
            walletAddress: user.walletAddress || null,
        });
    } catch (error) {
        console.error('Error fetching wallet:', error);
        res.status(500).json({ message: 'Error fetching wallet', error });
    }
};

export const updateMyWallet = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const email = req.user?.email;
        const { walletAddress } = req.body as { walletAddress?: string };

        if (!email) {
            res.status(401).json({ message: 'Missing user context' });
            return;
        }

        if (!walletAddress || typeof walletAddress !== 'string') {
            res.status(400).json({ message: 'walletAddress is required' });
            return;
        }

        const normalizedAddress = walletAddress.trim().toLowerCase();
        const isWalletAddressValid = /^0x[a-f0-9]{40}$/.test(normalizedAddress);

        if (!isWalletAddressValid) {
            res.status(400).json({ message: 'Invalid wallet address format' });
            return;
        }

        const walletOwner = await User.findOne({
            walletAddress: normalizedAddress,
            email: { $ne: email },
        }).select('_id');

        if (walletOwner) {
            res.status(409).json({ message: 'Wallet address already linked to another account' });
            return;
        }

        const user = await User.findOneAndUpdate(
            { email },
            { walletAddress: normalizedAddress },
            { returnDocument: 'after' }
        ).select('email walletAddress');

        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        res.status(200).json({
            message: 'Wallet linked successfully',
            email: user.email,
            walletAddress: user.walletAddress,
        });
    } catch (error) {
        console.error('Error updating wallet:', error);
        res.status(500).json({ message: 'Error updating wallet', error });
    }
};
