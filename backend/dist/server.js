import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import usersRouter from "./routes/users.js";
import walletRouter from "./routes/wallet.js";
import campaignsRouter from "./routes/campaigns.js";
dotenv.config({ path: ["./.env", "./src/.env"], override: true });
const startServer = async () => {
    await connectDB();
    const app = express();
    app.use(cors());
    app.use(express.json());
    app.get("/", (_req, res) => {
        res.send("API running");
    });
    app.use("/api/users", usersRouter);
    app.use("/api/campaigns", campaignsRouter);
    app.use("/api/wallets", walletRouter);
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
};
startServer().catch((error) => {
    console.error("Server startup failed:", error);
    process.exit(1);
});
//# sourceMappingURL=server.js.map