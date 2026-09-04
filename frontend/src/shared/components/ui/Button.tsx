type TextFieldProps = {
    content: string;
    size: "fit" | "free";
    disabled: boolean;
};

export function SubmitButton({ content, size, disabled }: TextFieldProps) {
    const sizeClass = {
        fit: "w-3/4 py-3",
        free: "w-32 py-3",
    } [size];
    return (
        <button
            type="submit"
            disabled={disabled}
            className={`bg-(--accent-color) rounded-full text-white font-medium ${sizeClass} hover:brightness-98 active:brightness-95 disabled:brightness-95`}
        > {content} </button>
    );
}