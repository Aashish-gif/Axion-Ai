import React from 'react';

type CardBg = 'white' | 'mint' | 'yellow' | 'blue' | 'lavender' | 'red';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    bg?: CardBg;
    hoverLift?: boolean;
    className?: string;
}

export function Card({ children, bg = 'white', hoverLift = false, className = '', ...props }: CardProps) {
    const backgrounds = {
        white: "bg-white",
        mint: "bg-card-mint",
        yellow: "bg-card-yellow",
        blue: "bg-card-blue",
        lavender: "bg-card-lavender",
        red: "bg-accent-red text-white"
    };

    const baseClass = "border-[3px] border-dark-border rounded-[24px] shadow-solid overflow-hidden";
    const hoverClass = hoverLift ? "transition-all hover:-translate-x-[3px] hover:-translate-y-[3px] hover:shadow-solid-lg" : "";

    return (
        <div className={`${baseClass} ${backgrounds[bg]} ${hoverClass} ${className}`} {...props}>
            {children}
        </div>
    );
}
