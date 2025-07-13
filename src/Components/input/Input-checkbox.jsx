const InputCheckbox = ({ id, classes, containerClasses, onChange, checked, value, label }) => {
  // Support both checked and value props for backward compatibility
  const isChecked = checked !== undefined ? checked : value;
  
  return (
    <div className={`flex items-center ${containerClasses || ""}`}>
      <input
        type="checkbox"
        id={id || null}
        className={`h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 ${
          classes || ""
        }`}
        checked={isChecked}
        onChange={onChange || null}
      />
      {label && (
        <label htmlFor={id} className="ml-2 text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
    </div>
  );
};

export default InputCheckbox;
