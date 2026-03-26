import mongoose from "mongoose";
const connectDB = async () => {
    const uri = process.env.MONGO_URI;
    if (!uri) {
        throw new Error("MONGO_URI is not defined in environment variables");
    }
    try {
        await mongoose.connect(uri);
        console.log("MongoDB connected");
    }
    catch (error) {
        const isServerSelectionError = error instanceof mongoose.Error.MongooseServerSelectionError;
        if (isServerSelectionError) {
            console.error("MongoDB connection error: cannot reach Atlas cluster.");
            console.error("Checklist: 1) Add current public IP to Atlas Network Access, 2) Ensure DB user/password are correct, 3) Prefer mongodb+srv URI from Atlas, 4) Verify local network/firewall allows outbound 27017/443.");
        }
        console.error("MongoDB connection error details:", error);
        throw error;
    }
};
export default connectDB;
//# sourceMappingURL=db.js.map