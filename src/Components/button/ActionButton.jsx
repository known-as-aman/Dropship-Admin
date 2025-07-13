import React from 'react';

const ActionButton = ({ 
  onClick, 
  icon, 
  label, 
  color = 'blue',
  className = '' 
}) => {
  const colorClasses = {
    blue: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
    red: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
    green: 'bg-green-600 hover:bg-green-700 focus:ring-green-500',
    yellow: 'bg-yellow-500 hover:bg-yellow-600 focus:ring-yellow-400',
    gray: 'bg-gray-600 hover:bg-gray-700 focus:ring-gray-500'
  };

  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded 
        shadow-sm text-white ${colorClasses[color]} focus:outline-none focus:ring-2 focus:ring-offset-2 
        transition-colors duration-200 ${className}`}
      title={label}
    >
      {icon && <span className="mr-1">{icon}</span>}
      {label}
    </button>
  );
};

export default ActionButton; 