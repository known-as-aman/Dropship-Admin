import React, { useMemo, useEffect, useState } from "react";
import InputText from "../../../Components/input/Input-text";
import InputCheckbox from "../../../Components/input/Input-checkbox";
import ButtonSave from "../../../Components/button/Submit";
import { XMarkIcon } from "@heroicons/react/24/outline";
import InputDropdown from "../../../Components/input/input-dropdown";
import HTMLEditor from "../../../Components/input/editor";
import { getCall, postCall, postFormDataCall } from "../../../services/apiCall";
import { getLoginToken } from "../../../services/token";
import { toast } from "react-toastify";
import Toast from "../../../Components/toast/toast";
import { getImageUrl } from "../../../services/helper";

const AddProduct = () => {
  const token = getLoginToken();

  const initialValue = {
    title: "",
    strikePrice: 0,
    price: 0,
    stock: 0,
    images: [],
    slug: "",
    isActive: true,
  };

  const [data, setData] = useState(initialValue);

  const [categoryId, setCategoryId] = useState(null);
  const [description, setDescription] = useState("");

  const [uploadedImage, setUploadedImage] = useState([]);
  const [manualSlug, setManualSlug] = useState(false);
  const [categoryList, setCategoryList] = useState([]);
console.log(uploadedImage);

  const submitHandler = async (e) => {
    e.preventDefault();

    const headers = {
      Authorization: `Bearer ${token}`,
    };

    const body = {
      ...data,
      description,
      categoryId
    };

    console.log(body);
    console.log(uploadedImage);

    let submitStatus = await postCall("/product", headers, body);
    if (submitStatus && submitStatus.status) {
      setData(initialValue);
      setCategoryId(null);
      setDescription("");
      setUploadedImage([]);
      toast.success(submitStatus.msg);
    } else {
      toast.error(submitStatus.msg || "Failed to add product");
    }
  };

  const fileHandler = async (e) => {
    try {
      const files = e.target.files;
      let uploadCount = 0;

      for (let file of files) {
        const headers = {
          authorization: `Bearer ${token}`,
        };
        const body = {
          files: file,
        };
        let uploadStatus = await postFormDataCall("/uploads", headers, body);

        if (uploadStatus.status) {
          setData((prev) => ({
            ...prev,
            images: [...prev.images, ...uploadStatus.data.map((item) => item.id)],
          }));
          setUploadedImage((prev) => [...prev, ...uploadStatus.data.map((item) => item.url)]);
          uploadCount++;
        } else {
          toast.error(`${uploadStatus.msg} \nFilename : ${file.name}`);
        }
      }

      toast.success(
        `${uploadCount} image${uploadCount > 1 ? "s" : ""} uploaded`
      );
    } catch (error) {
      console.log(error);
    }
  };

  const getCategory = async () => {
    const headers = {
      Authorization: `Bearer ${token}`,
    };
    let data = await getCall("/category", headers);

    if (data && data.status) {
      setCategoryList(data.data?.categories);
    }
  };

  useEffect(() => {
    getCategory();
  }, []);

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
      <section className="flex flex-col gap-8">
        <div className="flex flex-col gap-4">
          <h1 className="text-2xl font-semibold capitalize">add product</h1>
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
                  placeholder="Enter product title"
                  value={data.title}
                  onChange={(e) =>
                    setData((prev) => ({ ...prev, title: e.target.value }))
                  }
                />
              </div>

              <div className="flex flex-col gap-1">
                <label
                  htmlFor="category"
                  className="font-medium text-md tracking-wide"
                >
                  Category
                </label>
                <InputDropdown
                  type="text"
                  id="category"
                  placeholder="Select product category"
                  value={categoryList.find(cat => cat.id === categoryId)?.title || ""}
                  setValue={(category) => setCategoryId(category.id)}
                  option={categoryList}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label
                  htmlFor="strikePrice"
                  className="font-medium text-md tracking-wide"
                >
                  MRP
                </label>
                <InputText
                  type="number"
                  id="strikePrice"
                  placeholder="Enter product MRP"
                  value={data.strikePrice}
                  onChange={(e) =>
                    setData((prev) => ({
                      ...prev,
                      strikePrice: Number(e.target.value),
                    }))
                  }
                />
              </div>

              <div className="flex flex-col gap-1">
                <label
                  htmlFor="price"
                  className="font-medium text-md tracking-wide"
                >
                  Price
                </label>
                <InputText
                  type="number"
                  id="price"
                  placeholder="Enter product price"
                  value={data.price}
                  onChange={(e) =>
                    setData((prev) => ({
                      ...prev,
                      price: Number(e.target.value),
                    }))
                  }
                />
              </div>

              <div className="flex flex-col gap-1">
                <label
                  htmlFor="stock"
                  className="font-medium text-md tracking-wide"
                >
                  Stock
                </label>
                <InputText
                  type="number"
                  id="stock"
                  placeholder="Enter product stock"
                  value={data.stock}
                  onChange={(e) =>
                    setData((prev) => ({
                      ...prev,
                      stock: Number(e.target.value),
                    }))
                  }
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
                    className="size-full bg-transparent outline-none py-2 px-6 truncate font-medium"
                    value={
                      data.images.length
                        ? `${data.images.length} Image${
                            data.images.length > 1 ? "s" : ""
                          } Uploaded`
                        : ""
                    }
                    disabled={true}
                  />
                  <input
                    type="file"
                    id="img"
                    className="hidden"
                    onChange={fileHandler}
                    multiple={true}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex gap-2">
                  <label
                    htmlFor="slug"
                    className="font-medium text-md tracking-wide"
                  >
                    Slug
                  </label>
                  <InputCheckbox
                    value={manualSlug}
                    onChange={(e) => setManualSlug(e.target.checked)}
                  />
                </div>
                <InputText
                  type="text"
                  id="slug"
                  placeholder="Product slug will be generated automatically"
                  value={data.slug}
                  onChange={(e) =>
                    setData((prev) => ({ ...prev, slug: e.target.value }))
                  }
                  disabled={manualSlug ? false : true}
                  classes={manualSlug ? null : "cursor-not-allowed"}
                />
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex gap-2">
                  <label
                    htmlFor="isActive"
                    className="font-medium text-md tracking-wide"
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
            </div>

            {uploadedImage.length > 0 && (
              <div className="flex flex-wrap gap-6">
                {uploadedImage.map((item, index) => (
                  <div className="grid-item relative size-40" key={item}>
                    <button
                      type="button"
                      className="rounded-full border-2 border-black bg-white p-0.5 absolute right-2 top-2"
                      onClick={() => {
                        setData((prev) => ({
                          ...prev,
                          images: data.images.filter((e, idx) => index !== idx),
                        }));

                        setUploadedImage(
                          uploadedImage.filter((e, idx) => index !== idx)
                        );
                      }}
                    >
                      <XMarkIcon className="size-5" />
                    </button>
                    <img
                      src={item ? getImageUrl(item) : ""}
                      alt="Zixen"
                      className="size-full object-cover border-2 border-black rounded-lg p-0.5"
                    />
                  </div>
                ))}
              </div>
            )}

            <div className="flex flex-col gap-1">
              <label
                htmlFor="description"
                className="font-medium text-md tracking-wide"
              >
                Description
              </label>
              <div className="bg-white">
                <HTMLEditor setValue={setDescription} />
              </div>
            </div>

            <div>
              <ButtonSave>Save</ButtonSave>
            </div>
          </form>
        </div>
      </section>
      <Toast />
    </>
  );
};

export default AddProduct;
