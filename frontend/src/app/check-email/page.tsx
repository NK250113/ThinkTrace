"use client";

import { client } from "@/src/api/client";
import { useState } from "react";
export default function UsersPage() {
    const [text, setText] = useState("fe");
    async function connecttest() {
        try {
            const { data, error } = await client.POST("/api/test", {});

            console.log("111");
            console.log("data:", data);
            console.log("error:", error);

            if (error) {
                console.error("API error:", error);
                return;
            }

            setText(JSON.stringify(data));
        } catch (e) {
            console.error("fetch exception:", e);
        }
        return;
    }
    return (
        <div className="w-2/3 h-3/4 gap-4 flex flex-col justify-center items-center bg-content rounded-2xl py-10 px-10 text-xl">
            <h1>登録処理は完了していません！</h1>
            <div>
                <h2 className="mb-2 text-lg">ご入力いただいたメールアドレスに、登録用のメールを送信しました。</h2>
                <p>メールをご確認いただき、<br/>メール内のリンクから登録を続けてください。</p>
            </div>
            <div>
                <h2 className="mb-2 text-lg">⚠メールが届かない場合⚠</h2>
                <p>迷惑メールフォルダをご確認ください。<br/>数分経っても届かない場合は、メールアドレスをご確認ください。</p>
            </div>
            <button type="button" onClick={connecttest}>テスト</button>
            <p>{text}</p>
        </div>
    );
}