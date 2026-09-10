import { useState } from "react";

export function FileBar({children}: {children: React.ReactNode}) {
    return (
        <div className="w-1/5 bg-content border-r-2 border-foreground">
            {children}
        </div>
    );
}
type helpBar = {
    contents: {title: string, content: React.ReactNode}[];
}
export function HelpBar({contents}: helpBar) {
    const [activeTab, setActiveTab] = useState(0);
    return (
        <div className="w-1/4 bg-content border-l-2 border-foreground">
            <div className="bg-foreground flex gap-px justify-start">
                {contents.map((item, idx) => (
                    <button type="button" onClick={() => setActiveTab(idx)}
                    className={`bg-content rounded-t-xs border-foreground ${activeTab === idx ? "border-b-2" : "border-none"}`}>
                    {item.title}</button>
                ))}
            </div>
            {contents.map((item, idx) => (
                <div className={`${activeTab === idx ? "block" : "hidden"}`}>{item.content}</div>
            ))}
        </div>
    );
}