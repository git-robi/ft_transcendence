import React from 'react';
import OctocatIcon from './icons/OctocatIcon';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: (e: React.FormEvent) => void;
  type?: 'button' | 'submit';
  variant?: 'primary' | 'secondary' | 'oauth' | 'github';
  className?: string;
}

const Button = ({ 
  children, 
  onClick, 
  type = 'button', 
  variant = 'primary',
  className = '' 
}: ButtonProps) => {

  const baseStyles = "w-full py-3 rounded font-medium transition hover:shadow-[0_4px_12px_rgba(0,0,0,0.5)] active:shadow-[inset_0_2px_8px_rgba(0,0,0,0.5)]";
  
  const variants = {
    primary: "bg-neutral-800 px-6 py-3",
    secondary: "bg-neutral-600 px-6 py-3",
    oauth: "bg-neutral-800 flex items-center justify-center gap-2 px-6 py-3",
    github: "bg-neutral-800 flex items-center justify-center gap-2 px-6 py-3",
    google: "bg-neutral-800 flex items-center justify-center gap-2 px-6 py-3",
  };

  const renderContent = () => {
    if (variant === 'github') {
      return (
        <>
          <OctocatIcon />
          {children}
        </>
      )
    };
    return children;
  };

  return (
    <button
      type={type}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant]} ${className}`}
    >
      {renderContent()}
    </button>
  );
};

export default Button;
