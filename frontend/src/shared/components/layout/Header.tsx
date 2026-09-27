import { AppLogo } from "./../ui/Title";

export function Header() {
    return (
        <header className="h-18 w-full bg-content">
            <div className="bg-accent/10 w-full h-full px-4 border-b-4 border-foreground border-double flex justify-between">
                <AppLogo className="h-full"/>
                <div className="flex gap-2">
                    <p>ユーザ</p>
                    <p>設定</p>
                </div>
            </div>
        </header>
    );
}