const ButtonSave = ({ children, onClick, classes }) => {
  return (
    <button
      type="submit"
      className={`px-5 py-2 rounded-md bg-blue-600 text-white shadow-md shadow-gray-500 hover:scale-105 transition-all duration-300 ${
        classes || ""
      }`}
      onClick={onClick || null}
    >
      {children}
    </button>
  );
};

export default ButtonSave;
