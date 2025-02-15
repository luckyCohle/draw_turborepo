import { MouseEventHandler, ReactNode } from "react";
import clsx from "clsx"; // Optional: use clsx for cleaner class merging
import zod from "zod";
interface ButtonProps {
  children: ReactNode;
  className?: string;
  handleClick?: MouseEventHandler<HTMLButtonElement>;
  btn?: btnType; // Sets button to a predefined style
}
export enum btnType {
  primary = "bg-indigo-600 text-white px-4 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
}

export const Button = ({ children, className, handleClick, btn }: ButtonProps) => {
 
  return (
    <button
      className={clsx(btn, className)} // Merging class names
      onClick={handleClick}
    >
      {children}
    </button>
  );
};
