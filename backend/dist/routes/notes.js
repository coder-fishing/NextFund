import express from "express";
import { getNotes, createNote, getNoteById, deleteNote, } from "../controllers/notesController.js";
const router = express.Router();
router.get("/test", (_req, res) => {
    res.json({ message: "API working - MongoDB connected successfully!" });
});
router.get("/", getNotes);
router.post("/", createNote);
router.get("/:id", getNoteById);
router.delete("/:id", deleteNote);
export default router;
//# sourceMappingURL=notes.js.map