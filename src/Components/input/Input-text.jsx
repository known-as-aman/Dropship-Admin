const InputText = ({
  type,
  placeholder,
  classes,
  containerClasses,
  onChange,
  value,
  disabled
}) => {
  const focusHandler = (e) => {
    let parentElement = e.target.parentElement;
    parentElement.classList.remove("after:w-0");
    parentElement.classList.add("after:w-full");
  };

  const blurHandler = (e) => {
    let parentElement = e.target.parentElement;
    parentElement.classList.remove("after:w-full");
    parentElement.classList.add("after:w-0");
  };

  return (
    <div
      className={`size-full relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-blue-700 after:transition-all after:duration-500 after:ease-in-out ${
        containerClasses || ""
      }`}
    >
      <input
        type={type || "text"}
        id="title"
        className={`size-full bg-transparent outline-none p-2 border-b-2 border-gray-400 focus:border-transparent ${
          classes || ""
        }`}
        placeholder={placeholder || null}
        value={value}
        onChange={onChange || null}
        onFocus={focusHandler}
        onBlur={blurHandler}
        disabled={disabled || false}
      />
    </div>
  );
};

export default InputText;
