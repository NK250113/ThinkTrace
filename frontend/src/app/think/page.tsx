import { useRef } from "react";

import FilePane from "@/src/feature/think/components/FilePane";
import TagPane from "@/src/feature/think/components/TagPane";
import { Header } from "@/src/shared/components/layout/Header";
import { FileBar, HelpBar } from "@/src/shared/components/layout/MainContent";
import { ResizerY } from "@/src/shared/components/ui/Resizer";

export default function ThinkPage() {
    const firstRef = useRef(null);
    return (
        <>
            <Header></Header>
            <div>
                <FileBar>
                    <TagPane ref={firstRef}></TagPane>
                    <ResizerY targetRef={firstRef} minHeight={100} maxHeight={500}/>
                    <FilePane></FilePane>
                </FileBar>
                <div className="flex-1">
                    <p>メイン部分</p>
                </div>
                <HelpBar contents={[
                    {title: "test1", content: <></>},
                    {title: "test2", content: <></>},
                ]}>
                </HelpBar>
            </div>
        </>
    );
}