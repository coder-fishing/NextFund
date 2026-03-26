import mongoose, { Document } from "mongoose";
interface INote extends Document {
    title: string;
    content: string;
    createdAt: Date;
    updatedAt: Date;
}
declare const Note: mongoose.Model<INote, {}, {}, {}, mongoose.Document<unknown, {}, INote, {}, mongoose.DefaultSchemaOptions> & INote & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, INote>;
export default Note;
//# sourceMappingURL=Note.d.ts.map