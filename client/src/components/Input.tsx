interface InputProps {
  type?: 'text' | 'password' | 'email';
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
}

const Input = ({ 
  type = 'text', 
  placeholder, 
  value, 
  onChange,
  className = ''
}: InputProps) => {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={`w-full px-4 py-3 bg-white text-neutral-800 rounded focus:outline-none focus:ring-2 focus:ring-neutral-500 ${className}`}
    />
  );
};

export default Input;
