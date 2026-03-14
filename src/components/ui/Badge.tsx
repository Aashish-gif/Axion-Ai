import React from 'react';

interface BadgeProps {
    children: React.ReactNode;
    variant?: 'red' | 'green' | 'dark' | 'yellow';
    className?: string;
}

export function Badge({ children, variant = 'red', className = '' }: BadgeProps) {
    const variants = {
        red: "bg-accent-red text-white",
        green: "bg-green-500 text-white",
        dark: "bg-dark-border text-white",
        yellow: "bg-card-yellow text-dark-border"
    };

    return (
        <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold border-[2.5px] border-dark-border shadow-[2px_2px_0px_#111827] ${variants[variant]} ${className}`}>
            {children}
        </span>
    );
}
