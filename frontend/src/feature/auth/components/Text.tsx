export function AuthText(props: React.ComponentProps<"input">) {
    return (
        <input
            {...props}
            autoCapitalize="off" // 頭文字を大文字にしない
            className = "w-full rounded-sm bg-(--subcontent-bg) border-4 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:border-(--accent-color)"
        ></input>
    );
}