import Note from "../models/Note.js";
export const getNotes = async (_req, res) => {
    try {
        const notes = await Note.find().sort({ createdAt: -1 });
        res.json(notes);
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching notes", error });
    }
};
export const createNote = async (req, res) => {
    const { title, content } = req.body;
    try {
        if (!title || !content) {
            res.status(400).json({ message: "Title and content are required" });
            return;
        }
        const note = await Note.create({ title, content });
        res.status(201).json(note);
    }
    catch (error) {
        res.status(500).json({ message: "Error creating note", error });
    }
};
export const getNoteById = async (req, res) => {
    try {
        const note = await Note.findById(req.params.id);
        if (!note) {
            res.status(404).json({ message: "Note not found" });
            return;
        }
        res.json(note);
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching note", error });
    }
};
export const deleteNote = async (req, res) => {
    try {
        const note = await Note.findByIdAndDelete(req.params.id);
        if (!note) {
            res.status(404).json({ message: "Note not found" });
            return;
        }
        res.json({ message: "Note deleted" });
    }
    catch (error) {
        res.status(500).json({ message: "Error deleting note", error });
    }
};
//# sourceMappingURL=notesController.js.map