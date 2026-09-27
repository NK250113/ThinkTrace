"use client";
import { useRef } from "react";

import FilePane from "@/src/feature/think/components/FilePane";
import MainPane from "@/src/feature/think/components/MainPane";
import TagPane from "@/src/feature/think/components/TagPane";
import { Header } from "@/src/shared/components/layout/Header";
import { FileBar, HelpBar } from "@/src/shared/components/layout/MainContent";
import { ResizerY } from "@/src/shared/components/ui/Resizer";

export default function ThinkPage() {
    const firstRef = useRef(null);
    return (
        <>
            <Header></Header>
            <div className="flex flex-1 w-full">
                <FileBar>
                    <TagPane ref={firstRef}></TagPane>
                    <ResizerY targetRef={firstRef} minHeight={100} maxHeight={500}/>
                    <FilePane></FilePane>
                </FileBar>
                <MainPane></MainPane>
                <HelpBar contents={[
                    {title: "test1", content: <></>},
                    {title: "test2", content: <></>},
                ]}>
                </HelpBar>
            </div>
        </>
    );
}