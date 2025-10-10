import React from 'react';

const FormInput = ({ 
  label, 
  type = 'text', 
  value, 
  onChange, 
  placeholder, 
  required = false,
  className = '',
  ...props 
}) => {
  const inputId = `input-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={`form-group ${className}`}>
      {label && (
        <label htmlFor={inputId} className="form-label">
          {label}
          {required && <span className="required">*</span>}
        </label>
      )}
      <input
        id={inputId}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="form-input"
        {...props}
      />

      <style jsx>{`
        .form-group {
          margin-bottom: 20px;
        }

        .form-label {
          display: block;
          margin-bottom: 8px;
          color: #ffffff;
          font-size: 14px;
          font-weight: 600;
        }

        .required {
          color: #f87171;
          margin-left: 4px;
        }

        .form-input {
          width: 100%;
          padding: 12px 16px;
          background: rgba(30, 41, 59, 0.8);
          border: 1px solid rgba(56, 68, 82, 0.6);
          border-radius: 8px;
          color: #ffffff;
          font-size: 14px;
          transition: all 0.2s ease;
          font-family: inherit;
        }

        .form-input::placeholder {
          color: #94a3b8;
        }

        .form-input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
          background: rgba(30, 41, 59, 0.95);
        }

        /* Light mode support */
        @media (prefers-color-scheme: light) {
          .form-label {
            color: #1e293b;
          }

          .form-input {
            background: rgba(255, 255, 255, 0.9);
            border: 1px solid rgba(148, 163, 184, 0.4);
            color: #1e293b;
          }

          .form-input::placeholder {
            color: #64748b;
          }

          .form-input:focus {
            background: rgba(255, 255, 255, 1);
            border-color: #3b82f6;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
          }
        }
      `}</style>
    </div>
  );
};

const FormTextarea = ({ 
  label, 
  value, 
  onChange, 
  placeholder, 
  required = false,
  rows = 4,
  className = '',
  ...props 
}) => {
  const textareaId = `textarea-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={`form-group ${className}`}>
      {label && (
        <label htmlFor={textareaId} className="form-label">
          {label}
          {required && <span className="required">*</span>}
        </label>
      )}
      <textarea
        id={textareaId}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        className="form-textarea"
        {...props}
      />

      <style jsx>{`
        .form-group {
          margin-bottom: 20px;
        }

        .form-label {
          display: block;
          margin-bottom: 8px;
          color: #ffffff;
          font-size: 14px;
          font-weight: 600;
        }

        .required {
          color: #f87171;
          margin-left: 4px;
        }

        .form-textarea {
          width: 100%;
          padding: 12px 16px;
          background: rgba(30, 41, 59, 0.8);
          border: 1px solid rgba(56, 68, 82, 0.6);
          border-radius: 8px;
          color: #ffffff;
          font-size: 14px;
          transition: all 0.2s ease;
          font-family: inherit;
          resize: vertical;
          min-height: 100px;
        }

        .form-textarea::placeholder {
          color: #94a3b8;
        }

        .form-textarea:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
          background: rgba(30, 41, 59, 0.95);
        }

        /* Light mode support */
        @media (prefers-color-scheme: light) {
          .form-label {
            color: #1e293b;
          }

          .form-textarea {
            background: rgba(255, 255, 255, 0.9);
            border: 1px solid rgba(148, 163, 184, 0.4);
            color: #1e293b;
          }

          .form-textarea::placeholder {
            color: #64748b;
          }

          .form-textarea:focus {
            background: rgba(255, 255, 255, 1);
            border-color: #3b82f6;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
          }
        }
      `}</style>
    </div>
  );
};

export { FormInput, FormTextarea };
export default FormInput;