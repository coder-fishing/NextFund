import mongoose, { Schema } from "mongoose";
const taskSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String },
    completed: { type: Boolean, default: false },
}, { timestamps: true });
const Task = mongoose.model("Task", taskSchema);
export default Task;
//# sourceMappingURL=task.js.map