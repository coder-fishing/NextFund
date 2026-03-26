import mongoose, { Document } from "mongoose";
interface ITask extends Document {
    title: string;
    description: string;
    completed: boolean;
}
declare const Task: mongoose.Model<ITask, {}, {}, {}, mongoose.Document<unknown, {}, ITask, {}, mongoose.DefaultSchemaOptions> & ITask & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, ITask>;
export default Task;
//# sourceMappingURL=task.d.ts.map