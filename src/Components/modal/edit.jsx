import React from "react";

const ModalEdit = ({
  children,
  title,
  open,
  setOpen,
  onSave,
  id=null,
  closeFn = null,
}) => {
  return (
    <div
      className={`${
        open
          ? "scale-100 w-screen h-screen right-0"
          : "scale-0 size-0 right-1/2"
      } bg-opacity-60 flex justify-center items-center z-40 bg-gray-700 absolute bottom-0 overflow-hidden transition-all duration-500 ease-in-out md:px-0 px-8`}
    >
      <div
        className={`transition-all duration-500 ease-in-out relative transform overflow-hidden rounded-lg bg-white flex flex-col justify-between text-left shadow-xl w-full md:w-full md:max-w-3xl max-h-[90%] z-50`}
      >
        <div className="bg-white border-b p-4">
          <h3 className="text-xl font-semibold leading-6 text-gray-900">
            {title}
          </h3>
        </div>

        <div className="px-6 py-4 w-full overflow-y-auto">{children}</div>

        <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 border-t">
          <button
            type="button"
            className="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 sm:ml-3 sm:w-auto hover:scale-105 transition-all duration-500"
            onClick={()=>onSave(id)}
          >
            Save
          </button>
          <button
            type="button"
            className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
            onClick={closeFn || (() => setOpen(false))}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalEdit;
