"use client";
import { useEffect, useRef, useState } from "react";

import { TagContent } from "@/src/shared/components/common/TextContent";
import { useTag } from "../hooks";
import { IconSearch } from "@tabler/icons-react";

export default function TagPane({ref}: {ref?: React.Ref<HTMLDivElement>;}) {
  const { tags, selectTag, deselectTag, searchTags } = useTag();
  return (
    <div ref={ref} className="overflow-auto">
      <p> タグを検索</p>
      <SearchTagText onclick={searchTags}/>
      <hr className="my-0.5 mx-2"/>
      <p className="sticky top-0 bg-subcontent">選択中のタグ</p>
      <div className="flex justify-start gap-2 flex-wrap">
        {tags.map((item) => <TagContent text={item.name} onClick={() => deselectTag(item.id)}
        className={item.disabled || !item.selected ? "hidden" : ""}/>)}
      </div>
      <hr className="my-0.5 mx-2"/>
      <p className="sticky top-0 bg-subcontent">その他のタグ</p>
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
      <div ref={searchRef} className={`sticky flex justify-between mx-2 rounded-sm bg-content border-line border-2
      has-[input:focus]:border-accent transition-[height] duration-300 ease-in h-7`}>
        <input
          type="text" autoCapitalize="off"
          className="flex-1 focus-visible:outline-none"
          onChange={(e) => setText(e.target.value)}
        />
        <button onClick={()=>onclick(text)} className="px-1 hover:brightness-98"><IconSearch className="size-4"/></button>
      </div>
      <div className="flex items-center">
        <p>並び替え：</p>
        <div className="flex gap-1 p-0.5">
          <button type="button" onClick={sortTagsByName} className={sortCriteria=="count" ? "" : "hidden"}>(名前順)</button>
          <button type="button" onClick={sortTagsByCount} className={sortCriteria=="name" ? "" : "hidden"}>(使用回数順)</button>
        </div>
      </div>
    </>
  );
}
