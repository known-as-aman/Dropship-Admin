import React, { useMemo, useRef, useState } from "react";
import InputText from "../../../Components/input/Input-text";
import InputCheckbox from "../../../Components/input/Input-checkbox";
import ButtonSave from "../../../Components/button/Submit";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { postCall, postFormDataCall } from "../../../services/apiCall";
import { getLoginToken } from "../../../services/token";
import Toast from "../../../Components/toast/toast";
import { toast } from "react-toastify";
import { imageUrlPrefix } from "../../../config/url";

const AddCategory = () => {
  const token = getLoginToken();

  const imageBox = useRef(null);

  const [data, setData] = useState({
    title: "",
    imageId: null,
    isActive: true
  });

  const [image, setImage] = useState(null);
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
        imageId: null,
        isActive: true
      });
      setImage(null);
      toast.success(createStatus.msg || "Category created successfully");
    } else {
      toast.error(createStatus.msg || "Failed to create category");
    }
  };

  const fileHandler = async (e) => {
    try {
      const file = e.target.files[0];
      const headers = {
        authorization: `Bearer ${token}`,
      };
      const body = {
        files: file,
      };
      let uploadStatus = await postFormDataCall("/uploads", headers, body);

      if (uploadStatus.status) {
        setData((prev) => ({ ...prev, imageId: uploadStatus.data }));
        setImage({
          id: uploadStatus.data,
          originalName: file.name,
          file: file
        });
        toast.success(uploadStatus.msg || "Image uploaded successfully");
      } else {
        toast.error(uploadStatus.msg || "Failed to upload image");
      }
    } catch (error) {
      console.log(error);
      toast.error("Error uploading image");
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
          <h1 className="text-2xl font-semibold capitalize">add category</h1>
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
                  placeholder="Enter category title"
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
                  htmlFor="image"
                  className="font-medium text-md tracking-wide"
                >
                  Image
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
                    value={image?.originalName || ""}
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
                        setData((prev) => ({ ...prev, imageId: null }));
                      }}
                    >
                      <XMarkIcon className="size-4" />
                    </button>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-4">
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
                
                <div className="flex items-center gap-4">
                  <label
                    htmlFor="isActive"
                    className="font-medium text-md whitespace-nowrap"
                  >
                    Active
                  </label>
                  <InputCheckbox
                    value={data.isActive}
                    onChange={(e) => 
                      setData((prev) => ({ ...prev, isActive: e.target.checked }))
                    }
                  />
                </div>
              </div>
              {image && (
                <div className="grid-item relative size-72">
                  <button
                    type="button"
                    className="rounded-full border-2 border-black bg-white p-0.5 absolute right-2 top-2"
                    onClick={() => {
                      imageBox.current.value = null;
                      setImage(null);
                      setData((prev) => ({ ...prev, imageId: null }));
                    }}
                  >
                    <XMarkIcon className="size-5" />
                  </button>
                  <img
                    src={image.file ? URL.createObjectURL(image.file) : `${imageUrlPrefix}/${image.id}`}
                    alt="Category"
                    className="size-full object-cover border-2 border-black rounded-lg p-0.5"
                  />
                </div>
              )}
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

export default AddCategory;
