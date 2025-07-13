import React from 'react';

const StatusBadge = ({ isActive, label }) => {
  const activeText = label || (isActive ? 'Active' : 'Inactive');
  
  return (
    <span 
      className={`px-3 py-1 inline-flex items-center text-xs leading-5 font-semibold rounded-full
      ${isActive 
        ? 'bg-green-100 text-green-800' 
        : 'bg-red-100 text-red-800'
      }`}
    >
      <span className={`mr-1.5 size-2 rounded-full ${isActive ? 'bg-green-500' : 'bg-red-500'}`}></span>
      {activeText}
    </span>
  );
};

export default StatusBadge; 