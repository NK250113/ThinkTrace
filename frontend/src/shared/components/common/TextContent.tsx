export function ErrorMessage({error}: {error: string}) {
    return (
        <p className="pb-4 text-red-500 text-sm">{error}</p>
    );
}

type TagContentProps = {
    text: string;
    className?: string;
} & React.ButtonHTMLAttributes<HTMLDivElement>;
export function TagContent({text, className, ...props}: TagContentProps) {
    return (
        <div className={`flex gap-0.5 px-1 py-0.5 rounded-sm bg-accent/50 text-accent-text ${className ?? ""}`} {...props}>
            <p>#</p><p>{text}</p>
        </div>
    );
}

type FileTableContentProps = {
    icon: React.ReactNode;
    title: string;
    onclick: ()=>void;
}
export function FileTableContent({icon, title, onclick}: FileTableContentProps) {
    return (
        <tr onClick={onclick}>
            {icon}
            <p className="truncate">{title}</p>
        </tr>
    );
}