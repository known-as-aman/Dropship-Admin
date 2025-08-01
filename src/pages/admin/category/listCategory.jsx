import {
  EyeIcon,
  PencilSquareIcon,
  TrashIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import React, { useEffect, useMemo, useRef, useState } from "react";
import Tooptip from "../../../Components/tool-tip/Tooltip";
import Pagination from "../../../Components/pagination/Pagination";
import ModalDelete from "../../../Components/modal/delete";
import ModalEdit from "../../../Components/modal/edit";
import InputText from "../../../Components/input/Input-text";
import InputCheckbox from "../../../Components/input/Input-checkbox";
import {
  deleteCall,
  getCall,
  postFormDataCall,
  putCall,
} from "../../../services/apiCall";
import { getLoginToken } from "../../../services/token";
import ModalDetails from "../../../Components/modal/details";
import ThreeDotSpinner from "../../../Components/spinner/Page";
import Toast from "../../../Components/toast/toast";
import { toast } from "react-toastify";
import { imageUrlPrefix } from "../../../config/url";
import Table from "../../../Components/table/Table";
import StatusBadge from "../../../Components/badge/StatusBadge";

const ListCategory = () => {
  const token = getLoginToken();
  const imageBox = useRef(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const initialData = {
    title: "",
    imageId: null,
    isActive: true,
    imageFile: null,
  };
  const [data, setData] = useState(initialData);

  const [currImage, setCurrImage] = useState(null);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [manualSlug, setManualSlug] = useState(false);
  const [categoryList, setCategoryList] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Pagination and search states
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // ****************** Edit start ******************
  const editOpenHandler = async (id) => {
    const headers = {
      Authorization: `Bearer ${token}`,
    };
    let data = await getCall(`/category/${id}`, headers);
    if (data && data.status) {
      setData({
        id: id,
        title: data.data.title,
        slug: data.data.slug,
        imageId: data.data?.image || null,
        isActive: data.data.isActive,
        imageFile: data.data?.imageFile || null,
      });
      
      // Set current image URL from imageFile if available
      if (data.data?.imageFile?.url) {
        setCurrImage(`${imageUrlPrefix}${data.data.imageFile.url}`);
      } else {
        setCurrImage(null);
      }
    }
    setEditOpen(true);
  };

  const editHandler = async (id) => {
    setLoading(true);
    const headers = {
      Authorization: `Bearer ${token}`,
    };
    let body = data;

    if (!manualSlug) {
      const { slug, ...rest } = data;
      body = rest;
    }

    let editStatus = await putCall(`/category/${id}`, headers, body);
    if (editStatus && editStatus.status) {
      toast.success(editStatus.msg || "Category updated successfully");
      setData(initialData);
      getCategory();
      setEditOpen(false);
    } else {
      setLoading(false);
      toast.error(editStatus.msg || "Failed to update category");
    }
  };

  const editCloseHandler = () => {
    setData(initialData);
    setCurrImage(null);
    setUploadedImage(null);
    setEditOpen(false);
  };
  // ****************** Edit end ******************

  // ****************** Details start ******************
  const detailOpenHandler = async (id) => {
    const headers = {
      Authorization: `Bearer ${token}`,
    };
    let data = await getCall(`/category/${id}`, headers);
    if (data && data.status) {
      setData({
        id: id,
        title: data.data.title,
        slug: data.data.slug,
        imageId: data.data?.image || null,
        isActive: data.data.isActive,
        imageFile: data.data?.imageFile || null,
      });
      
      // Set current image URL from imageFile if available
      if (data.data?.imageFile?.url) {
        setCurrImage(`${imageUrlPrefix}${data.data.imageFile.url}`);
      } else {
        setCurrImage(null);
      }
    }
    setDetailsOpen(true);
  };

  const detailCloseHandler = () => {
    setData(initialData);
    setCurrImage(null);
    setDetailsOpen(false);
  };
  // ****************** Details end ******************

  // ****************** Delete start ******************
  const deleteOpenHandler = async (id) => {
    setData({ id: id });
    setDeleteOpen(true);
  };

  const deleteHandler = async (id) => {
    setLoading(true);
    const headers = {
      Authorization: `Bearer ${token}`,
    };

    let deleteStatus = await deleteCall(`/category/${id}`, headers);
    if (deleteStatus && deleteStatus.status) {
      toast.success(deleteStatus.msg || "Category deleted successfully");
      setData(initialData);
      getCategory();
      setDeleteOpen(false);
    } else {
      setLoading(false);
      toast.error(deleteStatus.msg || "Failed to delete category");
    }
  };

  const deleteCloseHandler = () => {
    setData(initialData);
    setDeleteOpen(false);
  };
  // ****************** Delete end ******************

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
        setUploadedImage({
          id: uploadStatus.data,
          originalName: file.name,
          file: file
        });
        setData((prev) => ({
          ...prev,
          imageId: uploadStatus.data
        }));
        toast.success(uploadStatus.msg || "Image uploaded successfully");
      } else {
        toast.error(uploadStatus.msg || "Failed to upload image");
      }
    } catch (error) {
      console.log(error);
      toast.error("Error uploading image");
    }
  };

  const getCategory = async () => {
    setLoading(true);
    try {
      const headers = {
        Authorization: `Bearer ${token}`,
      };
      
      let queryParams = `page=${page}&limit=${limit}`;
      if (debouncedSearch) queryParams += `&search=${debouncedSearch}`;
      
      let data = await getCall(`/category?${queryParams}`, headers);
      if (data && data.status) {
        setCategoryList(data.data.categories || data.data);
        if (data.data.totalPages) {
          setTotalPages(data.data.totalPages);
        }
      } else {
        toast.error(data?.msg || "Failed to fetch categories");
        setCategoryList([]);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("An error occurred while fetching categories");
      setCategoryList([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setDebouncedSearch(search);
    setPage(1);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const clearSearch = () => {
    setSearch("");
    setDebouncedSearch("");
    setPage(1);
  };

  // Debounce search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    getCategory();
  }, [page, limit, debouncedSearch]);

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
      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-4">
          <h1 className="text-2xl font-semibold capitalize">list category</h1>
        </div>

        {/* Search Section */}
        <div className="w-full flex gap-4 items-center">
          <form onSubmit={handleSearch} className="flex-1 flex items-center">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search categories..."
                value={search}
                onChange={handleSearchChange}
                className="w-full border border-gray-300 rounded-md py-2 px-4 pr-10"
              />
              <button 
                type="submit" 
                className="absolute right-2 top-1/2 transform -translate-y-1/2"
                disabled={loading}
              >
                {loading && search === debouncedSearch ? (
                  <svg className="animate-spin h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-500" />
                )}
              </button>
            </div>
          </form>
          
          <button
            onClick={clearSearch}
            className={`bg-gray-200 hover:bg-gray-300 px-4 py-3 rounded text-sm ${!search && !debouncedSearch ? "opacity-50 cursor-not-allowed" : "bg-red-600 text-white"}`}
            disabled={!search && !debouncedSearch}
          >
            Clear
          </button>
        </div>

        <div className="w-full pt-4 flex flex-col gap-6 items-center">
          {loading ? (
            <ThreeDotSpinner />
          ) : (
            <>
              <Table
                headers={[
                  { label: "Sl No.", width: "lg:w-[100px]" },
                  { label: "Title" },
                  { label: "Slug" },
                  { label: "Status" },
                  { label: "Action", width: "lg:w-[200px]" }
                ]}
                data={categoryList}
                renderRow={(item, index) => (
                  <tr
                    className="hover:bg-gray-50 transition-colors duration-150"
                    key={item.id}
                  >
                    <td className="px-4 py-3 text-sm">
                      {((page - 1) * limit) + index + 1}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium">
                      {item.title}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {item.slug}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <StatusBadge isActive={item.isActive} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => detailOpenHandler(item.id)}
                          className="p-1 text-green-600 hover:bg-green-100 rounded-full transition-colors duration-150"
                          title="View"
                        >
                          <EyeIcon className="size-5" />
                        </button>
                        <button
                          onClick={() => editOpenHandler(item.id)}
                          className="p-1 text-blue-600 hover:bg-blue-100 rounded-full transition-colors duration-150"
                          title="Edit"
                        >
                          <PencilSquareIcon className="size-5" />
                        </button>
                        <button
                          onClick={() => deleteOpenHandler(item.id)}
                          className="p-1 text-red-600 hover:bg-red-100 rounded-full transition-colors duration-150"
                          title="Delete"
                        >
                          <TrashIcon className="size-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
                emptyMessage={
                  debouncedSearch ? `No categories found matching "${debouncedSearch}"` : "No categories found"
                }
              />
              <div className="w-full flex justify-end">
                <Pagination 
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            </>
          )}
        </div>
      </section>

      <ModalDelete
        title="Category"
        open={deleteOpen}
        id={data?.id}
        onClose={deleteCloseHandler}
        onDelete={deleteHandler}
      />

      <ModalEdit
        title="Edit Category"
        open={editOpen}
        setOpen={setEditOpen}
        onSave={editHandler}
        onClose={editCloseHandler}
        id={data?.id}
      >
        <div className="size-full grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
          <div className="flex flex-col gap-1">
            <label
              htmlFor="title"
              className="font-medium text-base tracking-wide"
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
              className="font-medium text-base tracking-wide flex gap-2 items-center"
            >
              Slug
              <InputCheckbox
                value={manualSlug}
                onChange={(e) => setManualSlug(e.target.checked)}
              />
            </label>
            <InputText
              type="text"
              id="slug"
              placeholder="Enter category slug"
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
              className="font-medium text-base tracking-wide"
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
                value={uploadedImage?.originalName || (data.imageFile?.originalName || "")}
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
              {(uploadedImage || currImage) && (
                <button
                  type="button"
                  className="absolute right-2 top-2 rounded-full hover:bg-gray-300 p-1"
                  onClick={() => {
                    imageBox.current.value = null;
                    setUploadedImage(null);
                    setCurrImage(null);
                    setData((prev) => ({
                      ...prev,
                      imageId: null,
                      imageFile: null
                    }));
                  }}
                >
                  <XMarkIcon className="size-4" />
                </button>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label
              htmlFor="isActive"
              className="font-medium text-base tracking-wide"
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
          
          {/* Display current image */}
          {currImage && !uploadedImage && (
            <div className="col-span-1 md:col-span-2 flex flex-col gap-2">
              <label className="font-medium text-base tracking-wide">Current Image</label>
              <div className="grid-item relative size-40">
                <img
                  src={currImage}
                  alt="Category"
                  className="size-full object-cover border-2 border-gray-300 rounded-lg p-0.5"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/static/image/no-data.jpg";
                  }}
                />
              </div>
            </div>
          )}
          
          {/* Display uploaded image */}
          {uploadedImage && (
            <div className="col-span-1 md:col-span-2 flex flex-col gap-2">
              <label className="font-medium text-base tracking-wide">New Image</label>
              <div className="grid-item relative size-40">
                <img
                  src={uploadedImage.file ? URL.createObjectURL(uploadedImage.file) : `${imageUrlPrefix}/${uploadedImage.id}`}
                  alt="Category"
                  className="size-full object-cover border-2 border-gray-300 rounded-lg p-0.5"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/static/image/no-data.jpg";
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </ModalEdit>

      <ModalDetails
        title="Category Details"
        open={detailsOpen}
        setOpen={setDetailsOpen}
        onClose={detailCloseHandler}
      >
        <div className="size-full grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-1">
            <label className="font-medium text-base tracking-wide">Title</label>
            <InputText type="text" value={data.title} disabled={true} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="font-medium text-base tracking-wide">Slug</label>
            <InputText type="text" value={data.slug || ""} disabled={true} />
          </div>

          <div className="col-span-1 md:col-span-2 flex items-start gap-4">
            <label className="font-medium text-base whitespace-nowrap">
              Active
            </label>
            <span
              className={`border border-black size-3 rounded-full mt-1.5 ${
                data?.isActive ? "bg-green-600" : "bg-red-600"
              }`}
            ></span>
          </div>
          
          {/* Display file information if available */}
          <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
          {currImage && (
              <div className="flex flex-col gap-2">
                <label className="font-medium text-base tracking-wide">Image</label>
                <div className="grid-item flex justify-start">
                  <img
                    src={currImage}
                    alt="Category"
                    className="max-h-80 object-contain border-2 border-gray-300 rounded-lg p-1"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/static/image/no-data.jpg";
                    }}
                  />
                </div>
              </div>
            )}
            {data.imageFile && (
              <div className="flex flex-col gap-1">
                <label className="font-medium text-base tracking-wide">File Info</label>
                <div className="text-sm text-gray-700">
                  <p>Original Name: {data.imageFile.originalName}</p>
                  <p>Size: {Math.round(data.imageFile.size / 1024)} KB</p>
                  <p>Type: {data.imageFile.mimeType}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </ModalDetails>

      <Toast />
    </>
  );
};

export default ListCategory;
