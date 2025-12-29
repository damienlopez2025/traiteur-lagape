import React from 'react';

const Card = ({ children, className = '', title, action, style = {} }) => {
    return (
        <div className={`card ${className}`} style={style}>
            {(title || action) && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }}>
                    {title && <h3 style={{ fontSize: '1.2rem', color: 'var(--color-text-main)', fontWeight: '600' }}>{title}</h3>}
                    {action && <div>{action}</div>}
                </div>
            )}
            {children}
        </div>
    );
};

export default Card;
