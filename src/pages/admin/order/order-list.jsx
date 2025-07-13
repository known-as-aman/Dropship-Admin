import {
  EyeIcon,
  PencilSquareIcon,
  TrashIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import React, { useEffect, useState } from "react";
import Tooptip from "../../../Components/tool-tip/Tooltip";
import Pagination from "../../../Components/pagination/Pagination";
import { getLoginToken } from "../../../services/token";
import { getCall } from "../../../services/apiCall";
import ThreeDotSpinner from "../../../Components/spinner/Page";
import { toast } from "react-toastify";
import Toast from "../../../Components/toast/toast";
import { getDateTime } from "../../../services/helper";
import { Link } from "react-router-dom";

const OrderList = () => {
  const token = getLoginToken();

  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  
  // Pagination and filter states
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  const getOrderList = async () => {
    const headers = {
      Authorization: `Bearer ${token}`,
    };
    
    let queryParams = `page=${page}&limit=${limit}`;
    if (search) queryParams += `&search=${search}`;
    if (status) queryParams += `&status=${status}`;
    
    let data = await getCall(`/orders?${queryParams}`, headers);

    if (data && data.status) {
      setOrders(data.data.orders || data.data);
      if (data.data.totalPages) {
        setTotalPages(data.data.totalPages);
      }
    }

    setLoading(false);
  };
  
  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    getOrderList();
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const clearFilters = () => {
    setSearch("");
    setStatus("");
    setPage(1);
    getOrderList();
  };
  
  const handleStatusChange = (e) => {
    setStatus(e.target.value);
    setPage(1);
    getOrderList();
  };

  useEffect(() => {
    getOrderList();
  }, [page, limit]);

  return (
    <>
      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-4">
          <h1 className="text-2xl font-semibold capitalize">Order List</h1>
        </div>
        
        {/* Search and Filter Section */}
        <div className="w-full flex flex-col md:flex-row gap-4 items-center">
          <form onSubmit={handleSearch} className="flex-1 flex items-center">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search orders..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full border border-gray-300 rounded-md py-2 px-4 pr-10"
              />
              <button 
                type="submit" 
                className="absolute right-2 top-1/2 transform -translate-y-1/2"
              >
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-500" />
              </button>
            </div>
          </form>
          
          <div className="flex gap-4 items-center">
            <div className="w-48">
              <select
                value={status}
                onChange={handleStatusChange}
                className="w-full border border-gray-300 rounded-md py-2 px-4"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            
            <button
              onClick={clearFilters}
              className="bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded text-sm"
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
              <table className="w-full">
                <thead>
                  <tr className="font-semibold text-lg border-y-2 border-gray-800">
                    <td className="whitespace-nowrap py-2 sm:pl-4">Sl No.</td>
                    <td className="whitespace-nowrap py-2 sm:pl-4">Order ID</td>
                    <td className="whitespace-nowrap py-2 sm:pl-4">Customer</td>
                    <td className="whitespace-nowrap py-2 sm:pl-4">Status</td>
                    <td className="whitespace-nowrap py-2 sm:pl-4">Payment</td>
                    <td className="whitespace-nowrap py-2 sm:pl-4">Total</td>
                    <td className="whitespace-nowrap py-2 sm:pl-4">
                      Order Date
                    </td>
                    <td className="whitespace-nowrap py-2 sm:pl-4">Actions</td>
                  </tr>
                </thead>
                <tbody>
                  {orders.length > 0 ? (
                    orders.map((order, index) => (
                      <tr
                        className="font-normal text-md border-b border-gray-500"
                        key={order.id}
                      >
                        {/* Serial Number */}
                        <td className="px-1 sm:px-2 py-1.5 pl-4">
                          {(page - 1) * limit + index + 1}
                        </td>

                        {/* Order ID */}
                        <td className="border-x border-gray-500 px-1 sm:px-2 py-1.5">
                          {order.orderId}
                        </td>

                        {/* User Info */}
                        <td className="border-x border-gray-500 px-1 sm:px-2 py-1.5">
                          <p className="trucate">
                            {order.customer?.name || "N/A"}
                          </p>
                        </td>

                        {/* Order Status */}
                        <td className="border-x border-gray-500 px-1 sm:px-2 py-1.5 capitalize text-center">
                          <span
                            className={`font-semibold ${
                              order.status === "delivered"
                                ? "text-green-500"
                                : order.status === "cancelled"
                                ? "text-red-500"
                                : "text-yellow-500"
                            }`}
                          >
                            {order.status}
                          </span>
                        </td>

                        {/* Payment Status */}
                        <td className="border-x border-gray-500 px-1 sm:px-2 py-1.5 capitalize text-center">
                          <span
                            className={`font-semibold ${
                              order.paymentStatus === "paid"
                                ? "text-green-500"
                                : "text-red-500"
                            }`}
                          >
                            {order.paymentStatus}
                          </span>
                        </td>

                        {/* Total Price */}
                        <td className="border-x border-gray-500 px-1 sm:px-2 py-1.5">
                          ₹ {order.totalAmount}
                        </td>

                        {/* Order Date */}
                        <td className="border-x border-gray-500 px-1 sm:px-2 py-1.5">
                          {getDateTime(order.createdAt)}
                        </td>

                        {/* Actions */}
                        <td className="py-1.5 border-l border-gray-500 pl-2 sm:pl-4">
                          <span className="flex items-center gap-4">
                            <Tooptip message="View">
                              <Link
                                to={`/admin/order-details?q=${order.id}`}
                                className="cursor-pointer"
                              >
                                <EyeIcon className="size-6 text-green-800" />
                              </Link>
                            </Tooptip>
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="py-4 text-center">
                        No orders found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
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

      <Toast />
    </>
  );
};

export default OrderList;
