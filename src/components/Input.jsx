import React from 'react';

const Input = ({ label, id, containerStyle = {}, ...props }) => {
    return (
        <div style={{ marginBottom: 'var(--spacing-md)', ...containerStyle }}>
            {label && <label htmlFor={id}>{label}</label>}
            <input id={id} {...props} style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }} />
        </div>
    );
};

export default Input;
