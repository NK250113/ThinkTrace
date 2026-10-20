"use client";
import { useRef } from "react";

import MainPane from "@/src/feature/think/components/MainPane";
import FilePane from "@/src/feature/think/components/FilePane";
import TagPane from "@/src/feature/think/components/TagPane";
import { Header } from "@/src/shared/components/layout/Header";
import { FileBar, HelpBar } from "@/src/shared/components/layout/BodyContent";
import { MarkerPane } from "@/src/feature/think/components/HelpBarContent";
import { ResizerY } from "@/src/shared/components/ui/Resizer";
import EditorProvider from "@/src/feature/think/components/editor/EditorProvider";

export default function ThinkPage() {
    const firstRef = useRef(null);
    return (
        <EditorProvider>
            <Header></Header>
            <div className="flex flex-1 min-h-0 w-full">
                <FileBar>
                    <TagPane ref={firstRef}></TagPane>
                    <ResizerY targetRef={firstRef} minHeight={100} maxHeight={500}/>
                    <FilePane></FilePane>
                </FileBar>
                <MainPane></MainPane>
                <HelpBar contents={[
                    {title: "エディター", content: <MarkerPane/>},
                    {title: "ノート", content: <></>},
                ]}>
                </HelpBar>
            </div>
        </EditorProvider>
    );
}