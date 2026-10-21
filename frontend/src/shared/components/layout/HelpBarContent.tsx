"use client";
import { useRef, type ReactNode } from "react";
import { type Icon } from '@tabler/icons-react'

import { ResizerY } from "./../ui/Resizer";

type markerPaneTableProps = {
  contents: {
    icon: Icon,
    id: string,
    onclick?: () => void,
    prefix?: string | undefined,
    explain: string,
  }[];
};
export function MarkerPaneTable({contents}: markerPaneTableProps) {
  return (
    <table className="w-full"><tbody>
      {contents.map((content, i) => {
        return (
          <tr key={content.id} onClick={content.onclick} onMouseDown={(e) => e.preventDefault()} className={`${i==0 ? "border-t" : ""} border-b border-foreground cursor-pointer`}>
            <td>
              <content.icon className="h-full size-4.5 m-1"/>
            </td>
            <td className="text-center pr-1">:</td>
            {content.prefix !== undefined && <td><p className="text-center">{content.prefix}</p></td>}
            <td><div className="w-[0.5px] h-4 mx-1 bg-line"/></td>
            <td className="w-full"><p>{content.explain}</p></td>
          </tr>
        );
      })}
    </tbody></table>
  );
}

type noteInfoPaneProps = {
  title: string;
}
export function noteInfoPane({title}: noteInfoPaneProps) {
  const firstRef = useRef(null);
  return (
    <div>
      <h1>{title}</h1>
      <button>管理者権限を譲渡</button>
      <div ref={firstRef}>
        <h4>編集を許可</h4>
      </div>
      <ResizerY targetRef={firstRef}/>
      <div ref={firstRef}>
        <h4>閲覧を許可</h4>
      </div>
    </div>
  );
}