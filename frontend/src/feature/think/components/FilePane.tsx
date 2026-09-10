
import { FileTableContent } from "@/src/shared/components/common/TextContent";
import { SubmitButton } from "@/src/shared/components/ui/Button";
import { useFile } from "../hooks";

export default function FileListPane({ref}: {ref?: React.Ref<HTMLDivElement>;}) {
    const { files, sortCriteria, searchFiles, selectFile, sortFilesByName, sortFilesByCreatedAt, sortFilesByUpdatedAt } = useFile();
    return (
        <div ref={ref}>
            <div className="flex gap-0.5">
                <SubmitButton content="上のタグでファイルを探す" size="fit" disabled={true}/>
                <p>並び替え：</p>
                <button type="button" onClick={sortFilesByCreatedAt} className={sortCriteria=="updated_at" ? "" : "hidden"}>(作成日順)</button>
                <button type="button" onClick={sortFilesByName} className={sortCriteria=="created_at" ? "" : "hidden"}>(更新日順)</button>
                <button type="button" onClick={sortFilesByUpdatedAt} className={sortCriteria=="name" ? "" : "hidden"}>(名前順)</button>
            </div>
            <table className="divide-y divide-foreground">
                {files.map((item)=><FileTableContent icon=<></> title={item.name} onclick={()=>selectFile(item.id)}/>)}
            </table>
        </div>
    );
}