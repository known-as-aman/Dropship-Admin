import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { useState } from "react";

const InputDropdown = ({
  classes,
  containerClasses,
  value,
  setValue,
  option = [],
  disable = false,
}) => {
  const [showOption, setShowOption] = useState(false);

  return (
    <div
      className={`size-full relative border border-gray-300 rounded-md z-20 transition-all ${
        showOption ? "ring-2 ring-blue-500 border-blue-500" : "hover:border-gray-400"
      } ${disable ? "bg-gray-100" : "bg-white"} ${
        containerClasses || ""
      }`}
    >
      <div
        className={`size-full bg-transparent outline-none px-3 h-10 flex justify-start items-center ${
          disable ? "cursor-not-allowed text-gray-500" : "cursor-pointer text-gray-700"
        } truncate ${
          classes || ""
        }`}
        onClick={() => !disable && setShowOption(!showOption)}
      >
        {value || <span className="text-gray-400">Select an option</span>}
      </div>

      <ChevronDownIcon
        className={`absolute right-3 top-1/2 -translate-y-1/2 size-4 transition-all ${
          showOption ? "rotate-180 text-blue-500" : "text-gray-500"
        } ${disable ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
        onClick={() => !disable && setShowOption(!showOption)}
      />

      {!disable && showOption && (
        <ul className="flex flex-col w-full z-50 absolute top-[calc(100%+5px)] rounded-md divide-y divide-gray-100 bg-white border border-gray-200 max-h-[247px] overflow-y-auto shadow-lg">
          {option.length > 0 ? (
            option.map((item) => (
              <li
                key={item._id}
                className="p-2.5 text-gray-700 hover:text-white hover:bg-blue-600 cursor-pointer transition-colors duration-150 text-sm"
                onClick={() => {
                  setValue(item);
                  setShowOption(false);
                }}
              >
                {item.title}
              </li>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center p-4">
              <img
                src="/static/image/no-data.jpg"
                className="w-full max-h-[200px] object-contain rounded-md"
                alt="No data available"
              />
              <p className="text-gray-500 text-sm mt-2">No options available</p>
            </div>
          )}
        </ul>
      )}
    </div>
  );
};

export default InputDropdown;
