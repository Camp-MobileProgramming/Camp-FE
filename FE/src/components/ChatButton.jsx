import React from 'react';

export default function ChatButton({ onClick, label = '전송', disabled = false, ariaLabel = '채팅 전송 버튼', style, ...rest }) {
    const baseStyle = {
        padding: '8px 12px',
        borderRadius: 8,
        border: 'none',
        background: disabled ? '#b0bec5' : '#1976d2',
        color: '#fff',
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontWeight: 600,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    };

    return (
        <button
            type="button"
            aria-label={ariaLabel}
            disabled={disabled}
            onClick={disabled ? undefined : onClick}
            style={{ ...baseStyle, ...style }}
            {...rest}
        >
            {label}
        </button>
    );
}