import type { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const Input = ({ 
  type = 'text', 
  placeholder, 
  value, 
  onChange,
  className = '',
  ...rest
}: InputProps) => {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={`w-full px-4 py-3 bg-white text-neutral-800 rounded focus:outline-none focus:ring-2 focus:ring-neutral-500 ${className}`}
      {...rest}
    />
  );
};

export default Input;
