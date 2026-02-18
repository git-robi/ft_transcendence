import React from 'react';

interface ToggleButtonProps {
  children: React.ReactNode;
  isPressed: boolean;
  onClick: () => void;
  className?: string;
}

const ToggleButton = ({
  children,
  isPressed,
  onClick,
  className = ''
}: ToggleButtonProps) => {
  const baseStyles = "w-full py-3 px-3 rounded front-medium transition whitespace-nowrap";
  const stateStyles = isPressed
    ? 'bg-neutral-900 shadow-[inset_0_2px_8px_rgba(0,0,0,2)] hover:shadow-none'
    : 'bg-neutral-800 hover:shadow-[0_4px_12px_rgba(0,0,0,0.5)]';
  
  return (
    <button
      type='button'
      onClick={onClick}
      className={`${baseStyles} ${stateStyles} ${className}`}
      aria-pressed={isPressed}
    >
      {children}
    </button>
  )
}

export default ToggleButton;