"use client";
import { useEffect, useRef, useState } from "react";
import { IconSearch } from "@tabler/icons-react";

import { TagContent } from "@/src/shared/components/common/TextContent";
import { InputText } from "@/src/shared/components/ui/Text";
import { useTag } from "../hooks";

type TagPaneProps = {
  ref?: React.Ref<HTMLDivElement>;
} & ReturnType<typeof useTag>
export default function TagPane( {ref, tags, selectTag, deselectTag, searchTags }: TagPaneProps ) {
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

  return (
    <>
      <InputText type="text" onChange={(e) => setText(e.target.value)}>
        <button onClick={()=>onclick(text)} className="hover:brightness-98"><IconSearch className="size-4"/></button>
      </InputText>
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
