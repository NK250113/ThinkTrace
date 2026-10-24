
import { FileTableContent } from "@/src/shared/components/common/TextContent";
import { IconSearch, IconPlus } from "@tabler/icons-react";
import { useFile, type TagInfo } from "../hooks";

type FilePaneProps = {
  ref?: React.Ref<HTMLDivElement>;
  tags: Array<TagInfo>
} & ReturnType<typeof useFile>
export default function FileListPane({ref, tags, files, sortCriteria, searchFiles, selectFile, sortFilesByName, sortFilesByCreatedAt, sortFilesByUpdatedAt}: FilePaneProps) {
  return (
    <div ref={ref}>
      <div className="flex justify-between items-center m-1">
        <div className="flex items-center gap-1">
          <button type="submit" onClick={()=>searchFiles(tags.map(row => row.id))} className="p-1 border-2 rounded-full border-background hover:border-line">
            <IconSearch className="size-4"/>
          </button>
          <p>並び替え：</p>
          <button type="button" onClick={sortFilesByCreatedAt} className={sortCriteria=="updated_at" ? "" : "hidden"}>(作成日順)</button>
          <button type="button" onClick={sortFilesByName} className={sortCriteria=="created_at" ? "" : "hidden"}>(更新日順)</button>
          <button type="button" onClick={sortFilesByUpdatedAt} className={sortCriteria=="name" ? "" : "hidden"}>(名前順)</button>
        </div>
        <button type="submit" className="h-full p-0.5 border-2 rounded-full border-line hover:border-foreground">
          <IconPlus className="size-4"/>
        </button>
      </div>
      <table className="divide-y divide-foreground">
        {files.map((item)=><FileTableContent icon=<></> title={item.name} onclick={()=>selectFile(item.id)}/>)}
      </table>
    </div>
  );
}