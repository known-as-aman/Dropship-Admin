const Tooptip = ({ message, children }) => {
  return (
    <div
      className="relative flex items-center justify-center"
      onMouseEnter={(e) => {
        let infoBox = e.currentTarget.firstChild;
        infoBox?.classList.remove("opacity-0");
        infoBox?.classList.add("opacity-100");
        infoBox?.classList.remove("top-0");
        infoBox?.classList.add("top-[calc(-100%-8px)]");
      }}
      onMouseLeave={(e) => {
        let infoBox = e.currentTarget.firstChild;
        infoBox?.classList.remove("opacity-100");
        infoBox?.classList.add("opacity-0");
        infoBox?.classList.remove("top-[calc(-100%-8px)]");
        infoBox?.classList.add("top-0");
      }}
    >
      <span className="absolute px-2 py-1 top-0 left-1/2 -translate-x-1/2 bg-gray-900 text-gray-50 rounded-md opacity-0 transition-all duration-300 ease-in-out">
        {message}
      </span>
      {children}
    </div>
  );
};

export default Tooptip;