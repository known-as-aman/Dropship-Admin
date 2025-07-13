import React, { useEffect, useState } from "react";
import InputText from "../../../Components/input/Input-text";
import InputCheckbox from "../../../Components/input/Input-checkbox";
import ButtonSave from "../../../Components/button/Submit";
import {
  EyeIcon,
  PencilSquareIcon,
  TrashIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import InputDropdown from "../../../Components/input/input-dropdown";
import HTMLEditor from "../../../Components/input/editor";
import ThreeDotSpinner from "../../../Components/spinner/Page";
import {
  deleteCall,
  getCall,
  postCall,
  putCall,
} from "../../../services/apiCall";
import { getLoginToken } from "../../../services/token";
import { toast } from "react-toastify";
import Toast from "../../../Components/toast/toast";
import Tooptip from "../../../Components/tool-tip/Tooltip";
import Pagination from "../../../Components/pagination/Pagination";
import ModalDelete from "../../../Components/modal/delete";
import ModalEdit from "../../../Components/modal/edit";
import ModalDetails from "../../../Components/modal/details";
import { getDateTime } from "../../../services/helper";
import Table from "../../../Components/table/Table";
import StatusBadge from "../../../Components/badge/StatusBadge";

const State = () => {
  const token = getLoginToken();
  const [data, setData] = useState({ name: "", isActive: true });
  const [editData, setEditData] = useState({ name: "", isActive: true });
  const [list, setList] = useState([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  const [filterActive, setFilterActive] = useState(null);

  const [editOpen, setEditOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const submitHandler = async (e) => {
    e.preventDefault();
    if (!data.name.trim()) {
      toast.error("State name is required");
      return;
    }

    const headers = {
      Authorization: `Bearer ${token}`,
    };
    
    setLoading(true);
    let createStatus = await postCall("/location/state", headers, data);

    if (createStatus && createStatus.status) {
      setData({ name: "", isActive: true });
      getState();
      toast.success(createStatus.msg);
    } else {
      setLoading(false);
      toast.error(createStatus?.msg || "Failed to create state");
    }
  };

  const editHandler = async (id) => {
    if (!editData.name.trim()) {
      toast.error("State name is required");
      return;
    }
    
    const headers = {
      Authorization: `Bearer ${token}`,
    };

    setLoading(true);
    let editStatus = await putCall(`/location/state/${id}`, headers, editData);
    if (editStatus && editStatus.status) {
      toast.success(editStatus.msg);
      setEditData({ name: "", isActive: true });
      getState();
      setEditOpen(false);
    } else {
      setLoading(false);
      toast.error(editStatus?.msg || "Failed to update state");
    }
  };

  const editOpenHandler = async (id) => {
    const headers = {
      Authorization: `Bearer ${token}`,
    };
    
    setLoading(true);
    let data = await getCall(`/location/state/${id}`, headers);

    if (data && data.status) {
      setEditData({
        id: data.data.id,
        name: data.data.name,
        isActive: data.data.isActive !== undefined ? data.data.isActive : true,
      });
    } else {
      toast.error(data?.msg || "Failed to fetch state details");
    }
    setLoading(false);
    setEditOpen(true);
  };

  const getState = async () => {
    const headers = {
      Authorization: `Bearer ${token}`,
    };
    
    // Build query parameters
    const queryParams = new URLSearchParams({
      page: pagination.page,
      limit: pagination.limit,
    });
    
    if (debouncedSearch) {
      queryParams.append("search", debouncedSearch);
    }
    
    // Only add isActive filter if it's not null
    if (filterActive !== null) {
      queryParams.append("isActive", filterActive);
    }
    
    setLoading(true);
    let response = await getCall(`/location/state?${queryParams.toString()}`, headers);

    if (response && response.status) {
      setList(response.data.states || []);
      setPagination(prev => ({
        ...prev,
        // Check for pagination data in the response structure
        total: response.data.pagination?.totalCount || response.data.total || 0,
        totalPages: response.data.pagination?.totalPages || Math.ceil((response.data.total || 0) / pagination.limit)
      }));
    } else {
      toast.error(response?.msg || "Failed to fetch states");
    }

    setLoading(false);
  };

  const editCloseHandler = () => {
    setEditData({ name: "", isActive: true });
    setEditOpen(false);
  };

  const detailOpenHandler = async (id) => {
    const headers = {
      Authorization: `Bearer ${token}`,
    };
    
    setLoading(true);
    let data = await getCall(`/location/state/${id}`, headers);

    if (data && data.status) {
      setEditData({
        id: data.data.id,
        name: data.data.name,
        isActive: data.data.isActive !== undefined ? data.data.isActive : true,
      });
    } else {
      toast.error(data?.msg || "Failed to fetch state details");
    }
    setLoading(false);
    setDetailsOpen(true);
  };

  const detailCloseHandler = () => {
    setEditData({ name: "", isActive: true });
    setDetailsOpen(false);
  };

  const deleteOpenHandler = async (id) => {
    setData({ id: id });
    setDeleteOpen(true);
  };

  const deleteHandler = async (id) => {
    setLoading(true);
    const headers = {
      Authorization: `Bearer ${token}`,
    };
    let deleteStatus = await deleteCall(`/location/state/${id}`, headers);
    if (deleteStatus && deleteStatus.status) {
      toast.success(deleteStatus.msg);
      setData({ name: "", isActive: true });
      getState();
      setDeleteOpen(false);
    } else {
      setLoading(false);
      toast.error(deleteStatus?.msg || "Failed to delete state");
    }
  };

  const deleteCloseHandler = () => {
    setData({ name: "", isActive: true });
    setDeleteOpen(false);
  };
  
  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, page }));
  };
  
  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };
  
  const handleSearch = (e) => {
    e.preventDefault();
    setDebouncedSearch(search);
    setPagination(prev => ({ ...prev, page: 1 }));
  };
  
  const handleFilterActiveChange = (value) => {
    setFilterActive(value);
  };
  
  const clearFilters = () => {
    if (!search && !debouncedSearch && filterActive === null) {
      return; // Nothing to clear
    }
    
    setSearch("");
    setDebouncedSearch("");
    setFilterActive(null);
    setPagination(prev => ({ ...prev, page: 1 }));
    // No need to call getState() here as it will be triggered by the useEffect
  };
  
  // Debounce search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    getState();
  }, [pagination.page, pagination.limit]);
  
  useEffect(() => {
    setPagination(prev => ({ ...prev, page: 1 }));
    getState();
  }, [debouncedSearch, filterActive]);

  return (
    <>
      <Toast />
      <section className="flex flex-col gap-8">
        <div className="flex flex-col gap-4">
          <h1 className="text-2xl font-semibold capitalize">State</h1>
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
                  Name
                </label>
                <InputText
                  type="text"
                  id="title"
                  placeholder="Enter state name"
                  value={data.name}
                  onChange={(e) =>
                    setData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  required
                />
              </div>
              <div className="flex flex-col gap-1">
                <label
                  htmlFor="isActive"
                  className="font-medium text-md tracking-wide"
                >
                  Status
                </label>
                <InputCheckbox
                  id="isActive"
                  value={data.isActive}
                  onChange={(e) =>
                    setData((prev) => ({ ...prev, isActive: e.target.checked }))
                  }
                  label="Active"
                />
              </div>
            </div>

            <div>
              <ButtonSave>Save</ButtonSave>
            </div>
          </form>
        </div>
      </section>

      <section className="flex flex-col gap-2 mt-4">
        <div className="flex flex-col gap-4">
          <h1 className="text-2xl font-semibold capitalize">List States</h1>
        </div>

        {/* Search and Filter */}
        <div className="w-full flex flex-col md:flex-row gap-4 items-start">
          <form onSubmit={handleSearch} className="flex-1 flex items-center">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search states..."
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
                !search && !debouncedSearch && filterActive === null
                ? "bg-gray-200 hover:bg-gray-300 opacity-50 cursor-not-allowed" 
                : "bg-red-600 hover:bg-red-700 text-white"
              }`}
              disabled={!search && !debouncedSearch && filterActive === null}
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
                  { label: "Name" },
                  { label: "Status" },
                  { label: "Created At" },
                  { label: "Action", width: "lg:w-[200px]" }
                ]}
                data={list}
                renderRow={(item, index) => (
                  <tr
                    className="hover:bg-gray-50 transition-colors duration-150"
                    key={item._id}
                  >
                    <td className="px-4 py-3 text-sm">
                      {(pagination.page - 1) * pagination.limit + index + 1}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium">
                      {item.name ?? "N/A"}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <StatusBadge isActive={item.isActive} />
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {getDateTime(item.createdAt) ?? "N/A"}
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
                  debouncedSearch || filterActive !== null 
                    ? "No states found matching your filters" 
                    : "No states found"
                }
                emptyDetails={
                  (debouncedSearch || filterActive !== null) && (
                    <>
                      {debouncedSearch && <span>Search: "{debouncedSearch}" </span>}
                      {filterActive !== null && (
                        <span>
                          {debouncedSearch ? " • " : ""}
                          Status: {filterActive ? "Active" : "Inactive"}
                        </span>
                      )}
                    </>
                  )
                }
                onClearFilters={clearFilters}
              />
              <div className="w-full flex justify-end">
                {pagination.totalPages > 0 && (
                  <Pagination 
                    currentPage={pagination.page}
                    totalPages={pagination.totalPages}
                    onPageChange={handlePageChange}
                  />
                )}
              </div>
            </>
          )}
        </div>
      </section>

      <ModalDelete
        title="State"
        open={deleteOpen}
        id={data?.id}
        onClose={deleteCloseHandler}
        onDelete={deleteHandler}
      />

      <ModalEdit
        title="Edit State"
        open={editOpen}
        setOpen={setEditOpen}
        onSave={editHandler}
        onClose={editCloseHandler}
        id={editData?.id}
      >
        <div className="size-full grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="flex flex-col gap-1">
            <label htmlFor="name" className="font-medium text-md tracking-wide">
              Name
            </label>
            <InputText
              type="text"
              id="name"
              placeholder="Enter state name"
              value={editData.name}
              onChange={(e) =>
                setEditData((prev) => ({ ...prev, name: e.target.value }))
              }
              required
            />
          </div>
          <div className="flex items-center gap-2">
            <InputCheckbox
              id="editIsActive"
              checked={editData.isActive}
              onChange={(e) =>
                setEditData((prev) => ({ ...prev, isActive: e.target.checked }))
              }
            />
            <label htmlFor="editIsActive" className="font-medium text-md tracking-wide">
              Active
            </label>
          </div>
        </div>
      </ModalEdit>

      <ModalDetails
        title="State Details"
        open={detailsOpen}
        setOpen={setDetailsOpen}
        closeFn={detailCloseHandler}
      >
        <div className="size-full grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="flex flex-col gap-1">
            <label className="font-medium text-md tracking-wide">Name</label>
            <InputText type="text" value={editData.name} readOnly />
          </div>
          <div className="flex flex-col gap-1">
            <label className="font-medium text-md tracking-wide">Status</label>
            <div className={`px-3 py-2 rounded ${editData.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {editData.isActive ? "Active" : "Inactive"}
            </div>
          </div>
        </div>
      </ModalDetails>
    </>
  );
};

export default State;
