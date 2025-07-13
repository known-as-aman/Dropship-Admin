import React, { useEffect, useState } from "react";
import InputText from "../../../Components/input/Input-text";
import ButtonSave from "../../../Components/button/Submit";
import {
  EyeIcon,
  PencilSquareIcon,
  TrashIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import InputDropdown from "../../../Components/input/input-dropdown";
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
import InputCheckbox from "../../../Components/input/Input-checkbox";
import Table from "../../../Components/table/Table";
import StatusBadge from "../../../Components/badge/StatusBadge";

const City = () => {
  const token = getLoginToken();
  const [data, setData] = useState({ name: "", isActive: true });
  const [editData, setEditData] = useState({ name: "", isActive: true });
  const [list, setList] = useState([]);
  const [state, setState] = useState({ _id: null, title: null });
  const [editState, setEditState] = useState({ _id: null, title: null });
  const [stateList, setStateList] = useState([]);

  const [editOpen, setEditOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Pagination and filtering
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
  });
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filterState, setFilterState] = useState({ id: null, title: null });
  const [filterActive, setFilterActive] = useState(null);

  const submitHandler = async (e) => {
    e.preventDefault();

    const headers = {
      authorization: `Bearer ${token}`,
    };

    const payload = {
      name: data.name,
      stateId: state.id,
      isActive: data.isActive
    };

    let createStatus = await postCall("/location/city", headers, payload);

    if (createStatus.status) {
      setData({ name: "", isActive: true });
      setState({ id: null, title: null });
      setLoading(true);
      getCity();
      toast.success(createStatus.msg);
    } else {
      toast.error(createStatus.msg || "Failed to create city");
    }
  };

  const editHandler = async (id) => {
    const headers = {
      Authorization: `Bearer ${token}`,
    };

    const payload = {
      name: editData.name,
      stateId: editState.id,
      isActive: editData.isActive
    };

    let editStatus = await putCall(`/location/city/${id}`, headers, payload);
    if (editStatus && editStatus.status) {
      toast.success(editStatus.msg);
      editCloseHandler();
      getCity();
    } else {
      toast.error(editStatus.msg || "Failed to update city");
    }
  };

  const editOpenHandler = async (id) => {
    const headers = {
      Authorization: `Bearer ${token}`,
    };
    let data = await getCall(`/location/city/${id}`, headers);

    if (data && data.status) {
      setEditData({
        id: data.data.id,
        name: data.data.name,
        isActive: data.data.isActive ?? true
      });
      setEditState({
        id: data.data?.state?.id,
        title: data.data?.state?.name,
      });
    } else {
      toast.error("Failed to fetch city details");
    }
    setEditOpen(true);
  };

  const getStateDropdown = async () => {
    const headers = {
      authorization: `Bearer ${token}`,
    };
    let list = await getCall("/location/state", headers);

    if (list && list.status) {
      setStateList(list.data.states.map((e) => ({ id: e.id, title: e.name })));
    } else {
      toast.error("Failed to fetch states");
    }
  };

  const getCity = async () => {
    setLoading(true);
    const headers = {
      authorization: `Bearer ${token}`,
    };
    
    // Build query parameters
    let queryParams = `?page=${pagination.page}&limit=${pagination.limit}`;
    if (debouncedSearch) queryParams += `&search=${debouncedSearch}`;
    if (filterState.id) queryParams += `&stateId=${filterState.id}`;
    if (filterActive !== null) queryParams += `&isActive=${filterActive}`;
    
    let response = await getCall(`/location/city${queryParams}`, headers);

    if (response && response.status) {
      setList(response.data?.cities || []);
      setPagination(prev => ({
        ...prev,
        // Check for pagination data in the response structure
        total: response.data.pagination?.totalCount || response.data.total || 0,
        totalPages: response.data.pagination?.totalPages || Math.ceil((response.data.total || 0) / pagination.limit)
      }));
    } else {
      toast.error("Failed to fetch cities");
    }

    setLoading(false);
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

  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, page }));
  };

  const clearFilters = () => {
    if (!search && !debouncedSearch && !filterState.id && filterActive === null) {
      return; // Nothing to clear
    }
    
    setSearch("");
    setDebouncedSearch("");
    setFilterState({ id: null, title: null });
    setFilterActive(null);
    setPagination(prev => ({ ...prev, page: 1 }));
    // No need to call getCity() here as it will be triggered by the useEffect
  };

  // Debounce search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    getCity();
    getStateDropdown();
  }, [pagination.page, pagination.limit]);

  useEffect(() => {
    setPagination(prev => ({ ...prev, page: 1 }));
    getCity();
  }, [debouncedSearch, filterState.id, filterActive]);

  const editCloseHandler = () => {
    setEditData({ name: "", isActive: true });
    setEditState({
      _id: null,
      title: null,
    });
    setEditOpen(false);
  };

  const detailOpenHandler = async (id) => {
    const headers = {
      Authorization: `Bearer ${token}`,
    };
    let data = await getCall(`/location/city/${id}`, headers);

    if (data && data.status) {
      setEditData({
        id: data.data.id,
        name: data.data.name,
        isActive: data.data.isActive ?? true
      });
      setEditState({
        id: data.data?.state?.id,
        title: data.data?.state?.name,
      });
    } else {
      toast.error("Failed to fetch city details");
    }
    setDetailsOpen(true);
  };

  const detailCloseHandler = () => {
    setEditData({ name: "", isActive: true });
    setEditState({
      _id: null,
      title: null,
    });
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
    let deleteStatus = await deleteCall(`/location/city/${id}`, headers);
    if (deleteStatus && deleteStatus.status) {
      toast.success(deleteStatus.msg);
      setData({ name: "", isActive: true });
      getCity();
      setDeleteOpen(false);
    } else {
      setLoading(false);
      toast.error(deleteStatus.msg || "Failed to delete city");
    }
  };

  const deleteCloseHandler = () => {
    setData({ name: "", isActive: true });
    setDeleteOpen(false);
  };

  return (
    <>
      <Toast />
      <section className="flex flex-col gap-8">
        <div className="flex flex-col gap-4">
          <h1 className="text-2xl font-semibold capitalize">City</h1>
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
                  placeholder="Enter city name"
                  value={data.name}
                  onChange={(e) =>
                    setData((prev) => ({ ...prev, name: e.target.value }))
                  }
                />
              </div>

              <div className="flex flex-col gap-1">
                <label
                  htmlFor="state"
                  className="font-medium text-md tracking-wide"
                >
                  Select State
                </label>
                <InputDropdown
                  type="text"
                  id="state"
                  placeholder="Select state"
                  value={state.title}
                  setValue={setState}
                  option={stateList}
                />
              </div>
              
              <div className="flex items-center gap-2">
                <InputCheckbox
                  id="isActive"
                  checked={data.isActive}
                  onChange={(e) =>
                    setData((prev) => ({ ...prev, isActive: e.target.checked }))
                  }
                />
                <label
                  htmlFor="isActive"
                  className="font-medium text-md tracking-wide"
                >
                  Active
                </label>
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
          <h1 className="text-2xl font-semibold capitalize">List Cities</h1>
        </div>

        {/* Search and Filter */}
        <div className="w-full flex flex-col md:flex-row gap-4 items-start">
          <form onSubmit={handleSearch} className="flex-1 flex items-center">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search cities..."
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
                placeholder="Filter by State"
                value={filterState.title || "Filter by State"}
                setValue={setFilterState}
                option={stateList}
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
                !search && !debouncedSearch && !filterState.id && filterActive === null
                ? "bg-gray-200 hover:bg-gray-300 opacity-50 cursor-not-allowed" 
                : "bg-red-600 hover:bg-red-700 text-white"
              }`}
              disabled={!search && !debouncedSearch && !filterState.id && filterActive === null}
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
                  { label: "State" },
                  { label: "Status" },
                  { label: "Created At" },
                  { label: "Action", width: "lg:w-[200px]" }
                ]}
                data={list}
                renderRow={(item, index) => (
                  <tr
                    className="hover:bg-gray-50 transition-colors duration-150"
                    key={item.id}
                  >
                    <td className="px-4 py-3 text-sm">
                      {(pagination.page - 1) * pagination.limit + index + 1}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium">
                      {item.name ?? "N/A"}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {item?.state?.name ?? "N/A"}
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
                  debouncedSearch || filterState.id || filterActive !== null 
                    ? "No cities found matching your filters" 
                    : "No cities found"
                }
                emptyDetails={
                  (debouncedSearch || filterState.id || filterActive !== null) && (
                    <>
                      {debouncedSearch && <span>Search: "{debouncedSearch}" </span>}
                      {filterState.id && (
                        <span>
                          {debouncedSearch ? " • " : ""}
                          State: {filterState.title}
                        </span>
                      )}
                      {filterActive !== null && (
                        <span>
                          {(debouncedSearch || filterState.id) ? " • " : ""}
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
                  currentPage={pagination.page}
                  totalPages={pagination.totalPages || Math.ceil(pagination.total / pagination.limit)}
                  onPageChange={handlePageChange}
                />
              </div>
            </>
          )}
        </div>
      </section>

      <ModalDelete
        title="City"
        open={deleteOpen}
        id={data?.id}
        onClose={deleteCloseHandler}
        onDelete={deleteHandler}
      />

      <ModalEdit
        title="Edit City"
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
              placeholder="Enter city name"
              value={editData.name}
              onChange={(e) =>
                setEditData((prev) => ({ ...prev, name: e.target.value }))
              }
            />
          </div>

          <div className="flex flex-col gap-1">
            <label
              htmlFor="state"
              className="font-medium text-md tracking-wide"
            >
              Select State
            </label>
            <InputDropdown
              type="text"
              id="state"
              placeholder="Select state"
              value={editState.title}
              setValue={setEditState}
              option={stateList}
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
            <label
              htmlFor="editIsActive"
              className="font-medium text-md tracking-wide"
            >
              Active
            </label>
          </div>
        </div>
      </ModalEdit>

      <ModalDetails
        title="City Details"
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
            <label className="font-medium text-md tracking-wide">State</label>
            <InputText type="text" value={editState.title} readOnly />
          </div>
          
          <div className="flex flex-col gap-1">
            <label className="font-medium text-md tracking-wide">Status</label>
            <InputText 
              type="text" 
              value={editData.isActive ? "Active" : "Inactive"} 
              readOnly 
            />
          </div>
        </div>
      </ModalDetails>
    </>
  );
};

export default City;
