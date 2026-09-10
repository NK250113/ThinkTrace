type SubmitButtonProps = {
    content: string;
    size: "fit" | "free";
    disabled: boolean;
};
export function SubmitButton({ content, size, disabled }: SubmitButtonProps) {
    const sizeClass = {
        fit: "w-3/4 py-3",
        free: "w-32 py-3",
    } [size];
    return (
        <button
            type="submit"
            disabled={disabled}
            className={`bg-accent rounded-full text-accent-color font-medium ${sizeClass} hover:brightness-98 active:brightness-95 disabled:brightness-95`}
        > {content} </button>
    );
}