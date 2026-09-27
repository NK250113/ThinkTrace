"use client";

import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

import { SubmitButton } from '@/src/shared/components/ui/Button';
import { CustomListItem } from '../editor';

export default function Editor() {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
            listItem: false,
            }),
            CustomListItem
        ],
    })

    const addTestNode = () => {
    editor.commands.insertContent({
    type: 'CustomBulletList',
    bulletImage: "/icon.ico"
    })
    console.log(editor.getJSON())
    }
    return (
        <div className="bg-content flex-1 p-1 relative top-0">
            <EditorContent editor={editor}/>
            <button onClick={() => {
                addTestNode()
            }}>入力</button>
            <button
            onClick={() => {
                editor?.commands.toggleBulletList()
            }}
            >
            箇条書き
            </button>
            <button onClick={() => {
                console.log(editor?.getJSON())
            }}>JSONを見る</button>
            <button
            type="button"
            onClick={() => {
                editor.commands.updateAttributes('listItem', {
                bulletImage: '/images/leaf.png',
                })
            }}
            >
            🌱に変更
            </button>
            <SubmitButton content="コミット" size="free" className="absolute bottom-4 right-4"/>
        </div>
    );
}
