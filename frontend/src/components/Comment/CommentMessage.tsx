import Image from "next/image";

type CommentMessageProps = {
    author: string;
    avatar?:string;
    content: string;
    createdAt: string;
};

export const CommentMessage = ({ author, avatar, content, createdAt }: CommentMessageProps) => {    
    return (
        <div className="flex items-start gap-3">
            <Image
                src={avatar || "/avatar.png"}
                alt="Avatar"
                width={36}
                height={36}
                className="rounded-full"
            />                        
        
            <div className="max-w-[85%]">
                <div className="rounded-2xl bg-slate-100 px-3 py-2">
                    <p className="text-sm font-semibold text-slate-900">{author}</p>
                    <p className="mt-0.5 text-sm text-slate-700">{content}</p>
                </div>
                    <p className="mt-1 text-xs text-slate-500">{createdAt}</p>
                </div>                               
        </div>
    );
}