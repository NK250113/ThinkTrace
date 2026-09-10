import { useEffect, useRef, useState } from "react";

import { TagContent } from "@/src/shared/components/common/TextContent";
import { useTag } from "../hooks";

export default function TagPane({ref}: {ref?: React.Ref<HTMLDivElement>;}) {
    const { tags, selectTag, deselectTag, searchTags } = useTag();
    return (
        <div ref={ref}>
            <p> タグを検索</p>
            <SearchTagText onclick={searchTags}/>
            <hr/>
            <p>選択中のタグ</p>
            <div className="flex justify-start gap-2 flex-wrap">
                {tags.map((item) => <TagContent text={item.name} onClick={() => deselectTag(item.id)}
                className={item.disabled || !item.selected ? "hidden" : ""}/>)}
            </div>
            <hr/>
            <p>その他のタグ</p>
            <div className="flex justify-start gap-2 flex-wrap">
                {tags.map((item) => <TagContent text={item.name} onClick={() => selectTag(item.id)}
                className={item.disabled || item.selected ? "hidden" : ""}/>)}
            </div>
        </div>
    );
}

function SearchTagText({onclick}: {onclick: (query: string)=>void}) {
    const { sortCriteria, sortTagsByName, sortTagsByCount } = useTag();

    const [text, setText] = useState("");
    const [isCompact, setIsCompact] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
    const handleScroll = () => {
        if (!searchRef.current) return;

        const { top } = searchRef.current.getBoundingClientRect();

        setIsCompact(top <= 0);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
        window.removeEventListener("scroll", handleScroll);
    };
    }, []);

    return (
        <>
            <div ref={searchRef} className={`sticky flex justify-between flex-1 ms-2 rounded-sm bg-subcontent border-accent border-2
            has-[input:focus]:border-accent transition-[height] duration-200 ease-in ${isCompact ? "h-14" : "h-10"}`}>
                <input
                    type="text" autoCapitalize="off"
                    className = "flex-1 focus-visible:outline-none"
                    onChange={(e) => setText(e.target.value)}
                />
                <button onClick={()=>onclick(text)} className="hover:brightness-98"><img/>🔍️</button>
                <button type="button" onClick={sortTagsByCount} className={`${isCompact ? "hidden" : ""}
                ${sortCriteria=="count" ? "" : "hidden"}`}>(回数順)</button>
                <button type="button" onClick={sortTagsByName} className={`${isCompact ? "hidden" : ""}
                ${sortCriteria=="name" ? "" : "hidden"}`}>(名前順)</button>
            </div>
            <div className="flex gap-2">
                <p>並び替え：</p>
                <div className="flex gap-1 p-0.5 bg-subcontent">
                    <button type="button" onClick={sortTagsByCount} className=
                    {sortCriteria=="count" ? "border-b-2 border-accent" : "opacity-98 hover:opacity-95"}>使用回数</button>
                    <button type="button" onClick={sortTagsByName} className=
                    {sortCriteria=="name" ? "border-b-2 border-accent" : "opacity-98 hover:opacity-95"}>名前順</button>
                </div>
            </div>
        </>
    );
}
