"use client";

import React from "react";
import { Play } from "lucide-react";

interface ButtonProps {
    children: React.ReactNode;
    onClick?: () => void;
    className?: string;
    icon?: React.ReactNode;
    style?: React.CSSProperties;
    disabled?: boolean;
}

const Button: React.FC<ButtonProps> = ({
    children,
    onClick,
    className = "",
    icon,
    style,
    disabled = false,
}) => {
    return (
        <button
            className={`btn-3d ${className}`}
            onClick={onClick}
            style={style}
            disabled={disabled}
        >
            {icon && <span className="btn-icon">{icon}</span>}
            <span>{children}</span>
        </button>
    );
};

export default Button;
