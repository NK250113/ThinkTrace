import { type ReactNode } from "react";

type InputTextProps = {children?: ReactNode} & React.ComponentProps<"input">;
export function InputText({children, ...props}: InputTextProps) {
  return (
    <div className={`sticky flex justify-between mx-2 p-1 rounded-sm bg-content border-line border-2
      has-[input:focus]:border-accent transition-[height] duration-300 ease-in h-7`}>
      <input
        {...props}
        autoCapitalize="off" // 頭文字を大文字にしない
        className = "flex-1 focus-visible:outline-none"
      />
      {children}
    </div>
  );
}