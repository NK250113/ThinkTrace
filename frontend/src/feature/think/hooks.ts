import { useEffect, useState } from 'react';

import { getTags, searchNotes, getNote } from './services';

export function useTag() {
    type TagInfo = {
        id: string;
        name: string;
        count: number;
        selected: boolean;
        disabled: boolean;
    };
    const [allTags, setAllTags] = useState<Array<TagInfo>>([]);
    const [sortCriteria, setSortCriteria] = useState<"name"|"count">("count");

    async function fetchTags() {
        type TagData = {
            name: string;
            count: number;
        }
        const data = await getTags(); // またあとでバックエンドを調整する必要がある
        setAllTags(data.map((item: TagData) =>
            { id: item.id, name: item.name, count: item.count, selected: false, disabled: false }
        ));
    }
    useEffect(() => {
        fetchTags();
        if (sortCriteria === "count") {
            sortTagsByCount();
        } else {
            sortTagsByName();
        }
    }, []);

    const selectTag = (id: string) => {
        const newArray = new Array(...allTags);
        for (const tag of newArray) {
            if (tag.id === id) {
                tag.selected = true;
            }
        }
        setAllTags(newArray);
    };
    const deselectTag = (id: string) => {
        const newArray = new Array(...allTags);
        for (const tag of newArray) {
            if (tag.id === id) {
                tag.selected = false;
            }
        }
        setAllTags(newArray);
    };

    const searchTags = (query: string) => {
        const regex = new RegExp(`^.*?${query}.*$`);
        const newArray = new Array(...allTags);
        for (const tag of newArray) {
            if (regex.test(tag.name)) {
                tag.disabled = false;
            } else {
                tag.disabled = true;
            }
        }
        setAllTags(newArray);
    };

    function sortTagsByName() {
        setSortCriteria("name");
        const newArray = new Array(...allTags);
        newArray.sort((a, b) => a.name.localeCompare(b.name));
        setAllTags(newArray);
    }

    function sortTagsByCount() {
        setSortCriteria("count");
        const newArray = new Array(...allTags);
        newArray.sort((a, b) => {
        if (a.count !== b.count) {
            return a.count - b.count;
        }
        return a.name.localeCompare(b.name);
        });
        setAllTags(newArray);
    }

    function getSelectedTags(): string[] {
        return Array.from(allTags.values())
            .filter(({ selected }) => selected)
            .map(({ id }) => id);
    };

    return { tags: allTags, selectTag, deselectTag, searchTags, sortTagsByName, sortTagsByCount, getSelectedTags, sortCriteria };
}

export function useFile() {
    type FileInfo = {
        id: string;
        name: string;
        created_at: number;
        updated_at: number;
    };
    const [files, setFiles] = useState<FileInfo[]>([]);
    const [sortCriteria, setSortCriteria] = useState<"name"|"created_at"|"updated_at">("updated_at"); // 更新日時、作成日時、名前

    const searchFiles = async () => {
        const data = await searchNotes({ tags: useTag().getSelectedTags() });
        setFiles(data);
        switch (sortCriteria) {
            case "name":
                sortFilesByName();
                break;
            case "created_at":
                sortFilesByCreatedAt();
                break;
            case "updated_at":
                sortFilesByUpdatedAt();
                break;
        }
    }

    const selectFile = async (note_id: string) => {
        const data = await getNote({ note_id });
    };

    function sortFilesByName() {
        setSortCriteria("name");
        const newArray = new Array(...files);
        newArray.sort((a, b) => a.name.localeCompare(b.name));
        setFiles(newArray);
    }

    function sortFilesByCreatedAt() {
        setSortCriteria("created_at");
        const newArray = new Array(...files);
        newArray.sort((a, b) => a.created_at - b.created_at);
        setFiles(newArray);
    }

    function sortFilesByUpdatedAt() {
        setSortCriteria("updated_at");
        const newArray = new Array(...files);
        newArray.sort((a, b) => a.updated_at - b.updated_at);
        setFiles(newArray);
    }

    return { files, sortCriteria, searchFiles, selectFile, sortFilesByName, sortFilesByCreatedAt, sortFilesByUpdatedAt };
}