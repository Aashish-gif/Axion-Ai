import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'dark';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    children: React.ReactNode;
    className?: string;
}

export function Button({ variant = 'primary', children, className = '', ...props }: ButtonProps) {
    const baseClass = "px-6 py-3 font-heading font-bold rounded-2xl border-[3px] border-dark-border shadow-button transition-all hover:-translate-x-[2px] hover:-translate-y-[2px] active:translate-x-0 active:translate-y-0 active:shadow-none";

    const variants = {
        primary: "bg-accent-red text-white hover:brightness-110",
        secondary: "bg-white text-dark-border hover:bg-gray-50",
        dark: "bg-dark-border text-white hover:bg-gray-800"
    };

    return (
        <button className={`${baseClass} ${variants[variant]} ${className}`} {...props}>
            {children}
        </button>
    );
}
