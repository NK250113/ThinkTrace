import { client } from "@/src/api/client";

export async function getTags() {
    const { data, error } = await client.GET("/api/think/load", {
    });
    if (error) {
        throw new Error("");
    }
    return data;
}; // また後でstyle, explode辺りの調整が必要、422のエラー形式を直す必要あり

type searchNotesProps = {
    tags: number[];
}
export async function searchNotes({ tags }: searchNotesProps) {
    const { data, error } = await client.GET("/api/think/search", {
        params: {
            query: {
                tags
            }
        }
    });
    if (error) {
        throw new Error("");
    }
    return data;
};

type getNoteProps = {
    note_id: number;
}
export async function getNote({ note_id }: getNoteProps) {
    const { data, error } = await client.GET("/api/think/{note_id}", {
        params: {
            path: {
                note_id
            }
        }
    });
    if (error) {
        throw new Error("");
    }
    return data;
};
