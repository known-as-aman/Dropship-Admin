import React, { useMemo, useRef, useState } from "react";
import InputText from "../../../Components/input/Input-text";
import InputCheckbox from "../../../Components/input/Input-checkbox";
import ButtonSave from "../../../Components/button/Submit";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { postCall, postFormDataCall } from "../../../services/apiCall";
import { getLoginToken } from "../../../services/token";
import HTMLEditor from "../../../Components/input/editor";
import Toast from "../../../Components/toast/toast";
import { toast } from "react-toastify";

const AddPage = () => {
  const token = getLoginToken();

  const imageBox = useRef(null);

  const [data, setData] = useState({
    title: "",
    image: "",
  });

  const [image, setImage] = useState(null);
  const [template, setTemplate] = useState("");
  const [manualSlug, setManualSlug] = useState(false);

  const submitHandler = async (e) => {
    e.preventDefault();
    const headers = {
      authorization: `Bearer ${token}`,
    };
    const body = data;
    let createStatus = await postCall("/category", headers, body);

    if (createStatus.status) {
      imageBox.current.value = null;
      setData({
        title: "",
        image: "",
      });
      setImage(null);
      toast.success(createStatus.msg);
    } else {
      toast.error(createStatus.msg);
    }
  };

  const fileHandler = async (e) => {
    try {
      const file = e.target.files[0];
      const headers = {
        authorization: `Bearer ${token}`,
      };
      const body = {
        file: file,
      };
      let uploadStatus = await postFormDataCall("/uploads", headers, body);

      if (uploadStatus.status) {
        setData((prev) => ({ ...prev, image: uploadStatus.data }));
        setImage(file);
        toast.success(uploadStatus.msg);
      } else {
        toast.error(uploadStatus.msg);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useMemo(() => {
    if (manualSlug) {
      setData((prev) => ({ ...prev, slug: "" }));
    } else {
      setData((prev) => {
        const { slug, ...rest } = prev;
        return rest;
      });
    }
  }, [manualSlug]);

  return (
    <>
      <Toast />
      <section className="flex flex-col gap-8">
        <div className="flex flex-col gap-4">
          <h1 className="text-2xl font-semibold capitalize">add static page</h1>
        </div>

        <div className="w-full py-4">
          <form
            className="size-full flex flex-col gap-12"
            onSubmit={submitHandler}
          >
            <div className="size-full grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="flex flex-col gap-1">
                <label
                  htmlFor="title"
                  className="font-medium text-md tracking-wide"
                >
                  Title
                </label>
                <InputText
                  type="text"
                  id="title"
                  placeholder="Enter page title"
                  value={data.title}
                  onChange={(e) =>
                    setData((prev) => ({ ...prev, title: e.target.value }))
                  }
                />
              </div>
              <div className="flex flex-col gap-1">
                <label
                  htmlFor="slug"
                  className="font-medium text-md tracking-wide"
                >
                  Slug
                </label>
                <InputText
                  type="text"
                  id="slug"
                  placeholder={
                    manualSlug
                      ? "Enter category slug"
                      : "Slug will be generated automatically"
                  }
                  value={data.slug || ""}
                  onChange={(e) =>
                    setData((prev) => ({ ...prev, slug: e.target.value }))
                  }
                  disabled={manualSlug ? false : true}
                  classes={manualSlug ? null : "cursor-not-allowed"}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label
                  htmlFor="logo"
                  className="font-medium text-md tracking-wide"
                >
                  Logo
                </label>
                <div className="size-full relative flex border-b-2 border-gray-400">
                  <label
                    htmlFor="img"
                    className="border-r-2 border-gray-400 px-6 hover:bg-gray-300 rounded-tl-md flex items-center justify-center cursor-pointer"
                  >
                    Upload
                  </label>
                  <input
                    type="text"
                    className="size-full bg-transparent outline-none py-2 px-6 truncate"
                    value={image?.name || ""}
                    disabled={true}
                  />
                  <input
                    type="file"
                    id="img"
                    className="hidden"
                    onChange={fileHandler}
                    multiple={false}
                    ref={imageBox}
                  />
                  {image && (
                    <button
                      type="button"
                      className="absolute right-2 top-2 rounded-full hover:bg-gray-300 p-1"
                      onClick={() => {
                        imageBox.current.value = null;
                        setImage(null);
                        setData((prev) => ({ ...prev, image: "" }));
                      }}
                    >
                      <XMarkIcon className="size-4" />
                    </button>
                  )}
                </div>
              </div>
              <div className="flex items-end gap-4 row-start-3 md:row-start-auto">
                <label
                  htmlFor="title"
                  className="font-medium text-md whitespace-nowrap"
                >
                  Enter slug manually
                </label>
                <InputCheckbox
                  value={manualSlug}
                  onChange={(e) => setManualSlug(e.target.checked)}
                />
              </div>
              {image && (
                <div className="grid-item relative size-72">
                  <button
                    type="button"
                    className="rounded-full border-2 border-black bg-white p-0.5 absolute right-2 top-2"
                    onClick={() => {
                      imageBox.current.value = null;
                      setImage(null);
                      setData((prev) => ({ ...prev, image: "" }));
                    }}
                  >
                    <XMarkIcon className="size-5" />
                  </button>
                  <img
                    src={image ? URL.createObjectURL(image) : ""}
                    alt="Zixen"
                    className="size-full object-cover border-2 border-black rounded-lg p-0.5"
                  />
                </div>
              )}
            </div>
            <div className="flex flex-col gap-1">
              <label
                htmlFor="template"
                className="font-medium text-md tracking-wide"
              >
                Template
              </label>
              <div className="bg-white">
                <HTMLEditor setValue={setTemplate} />
              </div>
            </div>
            <div>
              <ButtonSave>Save</ButtonSave>
            </div>
          </form>
        </div>
      </section>
    </>
  );
};

export default AddPage;
