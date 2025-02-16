import React from 'react';

interface propType {
  placeholder: string;
  name: string;
  type?: string;
  value?: string; // Ensure value is included
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void; // Ensure onChange is typed correctly
  classes?: string;
}

export const Input = ({
  placeholder,
  name,
  type = "text",
  value,
  onChange,
  classes = "",
}: propType) => {
  return (
    <div>
      <input
        type={type}
        placeholder={placeholder}
        name={name}
        value={value}
        onChange={onChange}
        className={`rounded p-2 focus:border-1 focus:ring-0 focus:outline-none ${classes}`}
      />
    </div>
  );
};