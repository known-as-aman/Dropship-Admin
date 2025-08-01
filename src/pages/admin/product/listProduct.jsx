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
import { getLoginToken } from "../../../services/token";
import {
  deleteCall,
  getCall,
  postFormDataCall,
  putCall,
} from "../../../services/apiCall";
import ThreeDotSpinner from "../../../Components/spinner/Page";
import InputDropdown from "../../../Components/input/input-dropdown";
import { toast } from "react-toastify";
import HTMLEditor from "../../../Components/input/editor";
import ModalDetails from "../../../Components/modal/details";
import Toast from "../../../Components/toast/toast";
import { imageUrlPrefix } from "../../../config/url";
import Table from "../../../Components/table/Table";
import StatusBadge from "../../../Components/badge/StatusBadge";
import ActionButton from "../../../Components/button/ActionButton";

const ListProduct = () => {
  const token = getLoginToken();
  const imageBox = useRef(null);

  const initialData = {
    title: "",
    strikePrice: 0,
    price: 0,
    stock: 0,
    images: [],
    slug: "",
    isActive: true,
  };

  const [data, setData] = useState(initialData);
  const [categoryId, setCategoryId] = useState(null);
  const [description, setDescription] = useState("");

  const [uploadedImage, setUploadedImage] = useState([]);
  const [manualSlug, setManualSlug] = useState(false);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const [categoryList, setCategoryList] = useState([]);
  const [productList, setProductList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination and filter states
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState(null);
  const [filterActive, setFilterActive] = useState(null);

  const getProduct = async () => {
    setLoading(true);
    try {
      const headers = {
        Authorization: `Bearer ${token}`,
      };
      
      let queryParams = `page=${page}&limit=${limit}`;
      if (debouncedSearch) queryParams += `&search=${debouncedSearch}`;
      if (filterCategory) queryParams += `&categoryId=${filterCategory}`;
      if (filterActive !== null) queryParams += `&isActive=${filterActive}`;
      
      let data = await getCall(`/product?${queryParams}`, headers);
      if (data && data.status) {
        setProductList(data.data.products || data.data);
        if (data.data.totalPages) {
          setTotalPages(data.data.totalPages);
        }
      } else {
        toast.error(data?.msg || "Failed to fetch products");
        setProductList([]);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("An error occurred while fetching products");
      setProductList([]);
    } finally {
      setLoading(false);
    }
  };

  const getCategory = async () => {
    const headers = {
      Authorization: `Bearer ${token}`,
    };
    let data = await getCall("/category", headers);

    if (data && data.status) {
      // Transform the categories to match the dropdown component's expected format
      const formattedCategories = (data.data?.categories || []).map(cat => ({
        _id: cat.id,
        id: cat.id,
        title: cat.title
      }));
      setCategoryList(formattedCategories);
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
          setUploadedImage((prev) => [
            ...prev,
            { _id: uploadStatus.data, file: file },
          ]);
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

  // ****************** Edit start ******************
  const editOpenHandler = async (id) => {
    const headers = {
      Authorization: `Bearer ${token}`,
    };
    let data = await getCall(`/product/${id}`, headers);

    if (data && data.status) {
      // Extract product images from the response
      const productImages = data.data.productImages || [];
      
      setData({
        id: data.data.id,
        title: data.data.title,
        slug: data.data.slug,
        images: productImages, // Store the full productImages array for display
        isActive: data.data.isActive,
        price: data.data.price,
        stock: data.data.stock,
        strikePrice: data.data.strikePrice,
      });
      setCategoryId(data.data.categoryId);
      setDescription(data.data.description);
    }
    setEditOpen(true);
  };

  const editHandler = async (id) => {
    const headers = {
      Authorization: `Bearer ${token}`,
    };

    // Get the file IDs from newly uploaded images
    let finalImgs = uploadedImage.map((e) => e._id);
    
    // If we have existing images, extract their fileIds and add to finalImgs
    if (data.images && data.images.length > 0) {
      const existingImageIds = data.images.map(img => 
        typeof img === 'string' ? img : img.fileId
      );
      finalImgs = [...existingImageIds, ...finalImgs];
    }

    let body = {
      ...data,
      description,
      images: finalImgs,
      categoryId,
    };
    
    if (!manualSlug) {
      const { slug, ...rest } = data;
      body = { 
        ...rest, 
        description, 
        images: finalImgs, 
        categoryId 
      };
    }

    let editStatus = await putCall(`/product/${id}`, headers, body);
    if (editStatus && editStatus.status) {
      toast.success(editStatus.msg || "Product updated successfully");
      setData(initialData);
      setUploadedImage([]);
      getProduct();
      setEditOpen(false);
    } else {
      toast.error(editStatus.msg || "Failed to update product");
    }
  };

  const editCloseHandler = () => {
    setData(initialData);
    setUploadedImage([]);
    setCategoryId(null);
    setDescription("");
    setManualSlug(false);
    setEditOpen(false);
  };
  // ****************** Edit end ******************

  // ****************** Details start ******************
  const detailOpenHandler = async (id) => {
    const headers = {
      Authorization: `Bearer ${token}`,
    };
    let data = await getCall(`/product/${id}`, headers);

    if (data && data.status) {
      // Extract product images from the response
      const productImages = data.data.productImages || [];
      
      setData({
        id: data.data.id,
        title: data.data.title,
        slug: data.data.slug,
        images: productImages, // Store the full productImages array
        isActive: data.data.isActive,
        price: data.data.price,
        stock: data.data.stock,
        strikePrice: data.data.strikePrice,
      });
      setCategoryId(data.data.categoryId);
      setDescription(data.data.description);
    }
    setDetailsOpen(true);
  };

  const detailCloseHandler = () => {
    setData(initialData);
    setCategoryId(null);
    setDescription("");
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
    let deleteStatus = await deleteCall(`/product/${id}`, headers);
    if (deleteStatus && deleteStatus.status) {
      toast.success(deleteStatus.msg || "Product deleted successfully");
      setData(initialData);
      getProduct();
      setDeleteOpen(false);
    } else {
      setLoading(false);
      toast.error(deleteStatus.msg || "Failed to delete product");
    }
  };

  const deleteCloseHandler = () => {
    setData(initialData);
    setDeleteOpen(false);
  };
  // ****************** Delete end ******************

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setDebouncedSearch(search);
    setPage(1);
  };

  const handleFilterActiveChange = (value) => {
    setFilterActive(value);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const clearFilters = () => {
    if (!search && !debouncedSearch && filterCategory === null && filterActive === null) {
      return; // Nothing to clear
    }
    
    setSearch("");
    setDebouncedSearch("");
    setFilterCategory(null);
    setFilterActive(null);
    setPage(1);
    
    // No need to call getProduct() here as it will be triggered by the useEffect when debouncedSearch changes
  };

  // Debounce search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    getProduct();
    getCategory();
  }, [page, limit]);

  useEffect(() => {
    setPage(1);
    getProduct();
  }, [debouncedSearch, filterCategory, filterActive]);

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
          <h1 className="text-2xl font-semibold capitalize">list product</h1>
        </div>

        {/* Search and Filter Section */}
        <div className="w-full flex flex-col md:flex-row gap-4 items-start">
          <form onSubmit={handleSearch} className="flex-1 flex items-center">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={handleSearchChange}
                className="w-full border border-gray-300 rounded-md py-2 px-4 pr-10"
              />
              <button 
                type="submit" 
                className="absolute right-2 top-1/2 transform -translate-y-1/2"
                disabled={loading && search === debouncedSearch}
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
          
          <div className="flex flex-wrap gap-4 items-center">
            <div className="w-48">
              <InputDropdown
                placeholder="Filter by Category"
                value={categoryList.find(cat => cat.id === filterCategory)?.title || "Filter by Category"}
                setValue={(category) => setFilterCategory(category.id)}
                option={categoryList}
              />
            </div>
            
            <div className="flex items-center gap-2">
              <label className="whitespace-nowrap font-medium">Status:</label>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <input
                    type="radio"
                    id="all"
                    name="status"
                    checked={filterActive === null}
                    onChange={() => handleFilterActiveChange(null)}
                    className="cursor-pointer"
                  />
                  <label htmlFor="all" className="cursor-pointer">All</label>
                </div>
                <div className="flex items-center gap-1">
                  <input
                    type="radio"
                    id="active"
                    name="status"
                    checked={filterActive === true}
                    onChange={() => handleFilterActiveChange(true)}
                    className="cursor-pointer"
                  />
                  <label htmlFor="active" className="cursor-pointer">Active</label>
                </div>
                <div className="flex items-center gap-1">
                  <input
                    type="radio"
                    id="inactive"
                    name="status"
                    checked={filterActive === false}
                    onChange={() => handleFilterActiveChange(false)}
                    className="cursor-pointer"
                  />
                  <label htmlFor="inactive" className="cursor-pointer">Inactive</label>
                </div>
              </div>
            </div>
            
            <button
              onClick={clearFilters}
              className={`px-4 py-2 rounded text-sm ${
                !search && !debouncedSearch && filterCategory === null && filterActive === null
                ? "bg-gray-200 hover:bg-gray-300 opacity-50 cursor-not-allowed" 
                : "bg-red-600 hover:bg-red-700 text-white"
              }`}
              disabled={!search && !debouncedSearch && filterCategory === null && filterActive === null}
            >
              Clear Filters
            </button>
          </div>
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
                  { label: "Category" },
                  { label: "MRP" },
                  { label: "Price" },
                  { label: "Stock" },
                  { label: "Status" },
                  { label: "Action", width: "lg:w-[200px]" }
                ]}
                data={productList}
                renderRow={(item, index) => (
                  <tr
                    className="hover:bg-gray-50 transition-colors duration-150"
                    key={item.id}
                  >
                    <td className="px-4 py-3 text-sm">
                      {(page - 1) * limit + index + 1}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium">
                      {item.title ?? "N/A"}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {categoryList.find(cat => cat.id === item.categoryId)?.title ?? "N/A"}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {item.strikePrice ?? "N/A"}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium">
                      {item.price ?? "N/A"}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {item.stock ?? "N/A"}
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
                  debouncedSearch || filterCategory !== null || filterActive !== null 
                    ? "No products found matching your filters" 
                    : "No products found"
                }
                emptyDetails={
                  (debouncedSearch || filterCategory !== null || filterActive !== null) && (
                    <>
                      {debouncedSearch && <span>Search: "{debouncedSearch}" </span>}
                      {filterCategory !== null && (
                        <span>
                          {debouncedSearch ? " • " : ""}
                          Category: {categoryList.find(cat => cat.id === filterCategory)?.title}
                        </span>
                      )}
                      {filterActive !== null && (
                        <span>
                          {(debouncedSearch || filterCategory !== null) ? " • " : ""}
                          Status: {filterActive ? "Active" : "Inactive"}
                        </span>
                      )}
                    </>
                  )
                }
                onClearFilters={clearFilters}
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
        title="Product"
        open={deleteOpen}
        id={data?.id}
        onClose={deleteCloseHandler}
        onDelete={deleteHandler}
      />

      <ModalEdit
        title="Edit Product"
        open={editOpen}
        setOpen={setEditOpen}
        onSave={editHandler}
        onClose={editCloseHandler}
        id={data?.id}
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
                  (uploadedImage.length || data.images.length)
                    ? `${uploadedImage.length || data.images.length} Image${
                        (uploadedImage.length || data.images.length) > 1 ? "s" : ""
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
          <div className="flex flex-wrap gap-6 mt-6">
            <h3 className="w-full font-medium text-md tracking-wide">New Images</h3>
            {uploadedImage.map((item, index) => (
              <div className="grid-item relative size-40" key={index}>
                <button
                  type="button"
                  className="rounded-full border-2 border-black bg-white p-0.5 absolute right-2 top-2"
                  onClick={() => {
                    setUploadedImage(
                      uploadedImage.filter((e, idx) => index !== idx)
                    );
                  }}
                >
                  <XMarkIcon className="size-5" />
                </button>
                <img
                  src={item.file ? URL.createObjectURL(item.file) : ""}
                  alt="Product"
                  className="size-full object-cover border-2 border-black rounded-lg p-0.5"
                />
              </div>
            ))}
          </div>
        )}

        {data.images && data.images.length > 0 && !uploadedImage.length && (
          <div className="flex flex-wrap gap-6 mt-6">
            <h3 className="w-full font-medium text-md tracking-wide">Current Images</h3>
            {data.images.map((fileId, index) => (
              <div className="grid-item relative size-40" key={index}>
                <button
                  type="button"
                  className="rounded-full border-2 border-black bg-white p-0.5 absolute right-2 top-2"
                  onClick={() => {
                    setData(prev => ({
                      ...prev,
                      images: prev.images.filter((_, idx) => idx !== index)
                    }));
                  }}
                >
                  <XMarkIcon className="size-5" />
                </button>
                <img
                  src={typeof fileId === 'string' ? `${imageUrlPrefix}/image/${fileId}` : `${imageUrlPrefix}${fileId.file?.url || ''}`}
                  alt={`Product ${index + 1}`}
                  className="size-full object-cover border-2 border-black rounded-lg p-0.5"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/static/image/no-data.jpg";
                  }}
                />
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-col gap-1 mt-6">
          <label
            htmlFor="description"
            className="font-medium text-md tracking-wide"
          >
            Description
          </label>
          <div className="bg-white">
            <HTMLEditor setValue={setDescription} value={description} />
          </div>
        </div>
      </ModalEdit>

      <ModalDetails
        title="Product Details"
        open={detailsOpen}
        setOpen={setDetailsOpen}
        onClose={detailCloseHandler}
      >
        <div className="size-full grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="flex flex-col gap-1">
            <label className="font-medium text-md tracking-wide">Title</label>
            <InputText
              type="text"
              placeholder="Enter product title"
              value={data.title}
              disabled={true}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-medium text-md tracking-wide">
              Category
            </label>
            <InputText
              type="text"
              placeholder="Select product category"
              value={categoryList.find(cat => cat.id === categoryId)?.title || ""}
              disabled={true}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-medium text-md tracking-wide">MRP</label>
            <InputText
              type="number"
              id="strikePrice"
              placeholder="Enter product MRP"
              value={data.strikePrice}
              disabled={true}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-medium text-md tracking-wide">Price</label>
            <InputText
              type="number"
              placeholder="Enter product price"
              value={data.price}
              disabled={true}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-medium text-md tracking-wide">Stock</label>
            <InputText
              type="number"
              placeholder="Enter product stock"
              value={data.stock}
              disabled={true}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-medium text-md tracking-wide">Status</label>
            <InputText
              type="text"
              placeholder="Product status"
              value={data.isActive ? "Active" : "Inactive"}
              disabled={true}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-medium text-md tracking-wide">Slug</label>
            <InputText
              type="text"
              placeholder="Product slug"
              value={data.slug}
              disabled={true}
            />
          </div>
        </div>

        {data.images && data.images.length > 0 && (
          <div className="flex flex-wrap gap-6 mt-6">
            <h3 className="w-full font-medium text-md tracking-wide">Product Images</h3>
            {data.images.map((item, index) => (
              <div className="grid-item relative size-40" key={index}>
                <img
                  src={item.file?.url ? `${imageUrlPrefix}${item.file.url}` : "/static/image/no-data.jpg"}
                  alt={`Product ${index + 1}`}
                  className="size-full object-cover border-2 border-black rounded-lg p-0.5"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/static/image/no-data.jpg";
                  }}
                />
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-col gap-1 mt-6">
          <label className="font-medium text-md tracking-wide">
            Description
          </label>
          <div className="bg-white border border-gray-300 p-4 rounded" 
               dangerouslySetInnerHTML={{ __html: description }}>
          </div>
        </div>
      </ModalDetails>
      <Toast />
    </>
  );
};

export default ListProduct;
