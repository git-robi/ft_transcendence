import React from "react";

interface ButtonProps {
	children: React.ReactNode;
	onClick?: (e: React.FormEvent) => void;
	type?: 'button' | 'submit';
	className?: string;
}

const FooterButton = ({
	children,
	onClick,
	type = 'button',
	className = ''
}: ButtonProps) => {
	return (
		<button
			type={type}
			onClick={onClick}
			className={`text-sm text-neutral-300 hover:text-white [text-shadow:2px_2px_4px_rgba(0,0,0,0.8)] bg-transparent border-none cursor-pointer ${className}`} >
				{children}
			</button>
	)
}

export default FooterButton;