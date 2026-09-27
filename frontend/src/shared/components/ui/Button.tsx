type SubmitButtonProps = {
    content: string;
    size: "fit" | "free";
    disabled?: boolean;
    className?: string;
};
export function SubmitButton({ content, size, disabled = false, className = "" }: SubmitButtonProps) {
    const sizeClass = {
        fit: "w-3/4 py-1",
        free: "px-4 py-1",
    } [size];
    return (
        <button
            type="submit"
            disabled={disabled}
            className={`bg-accent rounded-full text-accent-color font-medium ${sizeClass} hover:brightness-98 active:brightness-95 disabled:brightness-95 ${className}`}
        > {content} </button>
    );
}