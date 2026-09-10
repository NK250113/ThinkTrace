import { AppLogo } from "./../ui/Title";

export function Header() {
    return (
        <header className="h-18 mx-4 flex justify-between bg-content border-b-4 border-foreground border-double">
            <AppLogo h="full"/>
            <div className="flex gap-2">
                <p>ユーザ</p>
                <p>設定</p>
            </div>
        </header>
    );
}