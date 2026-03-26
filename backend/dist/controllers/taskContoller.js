import Task from '../models/task.js';
export const getTasks = async (_req, res) => {
    try {
        const tasks = await Task.find();
        res.json(tasks);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching tasks', error });
    }
};
export const createTask = async (req, res) => {
    const { title, description } = req.body;
    try {
        const newTask = new Task({ title, description });
        await newTask.save();
        res.status(201).json(newTask);
    }
    catch (error) {
        res.status(500).json({ message: 'Error creating task', error });
    }
};
export const updateTask = async (req, res) => {
    const { id } = req.params;
    const { title, description, completed } = req.body;
    try {
        const updatedTask = await Task.findByIdAndUpdate(id, { title, description, completed }, { new: true });
        if (!updatedTask) {
            res.status(404).json({ message: 'Task not found' });
        }
        else {
            res.json(updatedTask);
        }
    }
    catch (error) {
        res.status(500).json({ message: 'Error updating task', error });
    }
};
export const deleteTask = async (req, res) => {
    const { id } = req.params;
    try {
        const deletedTask = await Task.findByIdAndDelete(id);
        if (!deletedTask) {
            res.status(404).json({ message: 'Task not found' });
        }
        else {
            res.json({ message: 'Task deleted successfully' });
        }
    }
    catch (error) {
        res.status(500).json({ message: 'Error deleting task', error });
    }
};
//# sourceMappingURL=taskContoller.js.map