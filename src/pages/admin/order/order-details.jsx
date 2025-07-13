import React, { useEffect, useState } from "react";
import { getLoginToken } from "../../../services/token";
import { getCall, postCall } from "../../../services/apiCall";
import { useNavigate } from "react-router-dom";
import ModalConfirm from "../../../Components/modal/confirm";
import ModalCancel from "../../../Components/modal/cancel";
import { imageUrlPrefix } from "../../../config/url";

const OrderDetails = () => {
  const token = getLoginToken();
  const navigate = useNavigate();

  const currentSlug = window.location.search;

  const [orderId, setOrderId] = useState("");
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState({});
  const [isCancelOrder, setIsCancelOrder] = useState(false);
  const [isConfirmOrder, setIsConfirmOrder] = useState(false);

  const getOrderDetails = async () => {
    const headers = {
      Authorization: `Bearer ${token}`,
    };
    let data = await getCall(`/orders/${orderId}`, headers);

    if (data && data.status) {
      setOrder(data.data);
    }

    setLoading(false);
  };

  const cancelCloseHanler = () => setIsCancelOrder(false);
  const cancelConfirmHanler = () => setIsConfirmOrder(false);

  const orderCancelHandler = async (id) => {
    const headers = {
      Authorization: `Bearer ${token}`,
    };
    const payload = {
      status: "cancelled",
    };
    let data = await postCall(`/orders/${id}/status`, headers, payload);

    if (data && data.status) {
      alert("Order updated successfully!");
    }

    cancelCloseHanler();
    getOrderDetails();
    setLoading(true);
  };

  const orderConfirmedHandler = async (id) => {
    const headers = {
      Authorization: `Bearer ${token}`,
    };
    const payload = {
      status: "confirmed",
    };
    let data = await postCall(`/orders/${id}/status`, headers, payload);

    if (data && data.status) {
      alert("Order updated successfully!");
    }

    cancelConfirmHanler();
    getOrderDetails();
    setLoading(true);
  };

  useEffect(() => {
    if (!currentSlug || !currentSlug.includes("?q=")) {
      window.alert("Invalid order ID");
      navigate("/admin/order-list");
      return null;
    }

    setOrderId(currentSlug.replaceAll("?q=", ""));
  }, []);

  useEffect(() => {
    if (orderId) {
      getOrderDetails();
    }
  }, [orderId]);

  return (
    <div className="min-h-screen">
      {/* Order Summary */}
      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="flex justify-between items-center border-b pb-4">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">
              Order: {order.orderId}
            </h2>
            <p className="text-sm text-gray-500">
              Last Updated: {new Date(order.updatedAt).toLocaleString()}
            </p>
          </div>
          <div className="flex gap-2">
            {order.status !== "confirmed" && (
              <button
                type="button"
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                onClick={() => setIsConfirmOrder(true)}
              >
                Confirm Order
              </button>
            )}

            {order.status !== "cancelled" && (
              <button
                type="button"
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                onClick={() => setIsCancelOrder(true)}
              >
                Cancel Order
              </button>
            )}
          </div>
        </div>

        {/* Order Details */}
        <div className="grid grid-cols-3 gap-4 mt-4">
          {/* Payment Details */}
          <div className="p-4 bg-gray-50 rounded-lg border">
            <h3 className="text-md font-semibold text-gray-700 mb-2">
              Payment Details
            </h3>
            <p className="text-sm text-gray-500">
              Method: {order.paymentMethod}
            </p>
            <p className="text-sm text-gray-500">
              Status: {order.paymentStatus}
            </p>
          </div>

          {/* Shipping Details */}
          <div className="p-4 bg-gray-50 rounded-lg border">
            <h3 className="text-md font-semibold text-gray-700 mb-2">
              Shipping Method
            </h3>
            <p className="text-sm text-gray-500">{order.shippingMethod}</p>
          </div>

          {/* Total Price */}
          <div className="p-4 bg-gray-50 rounded-lg border">
            <h3 className="text-md font-semibold text-gray-700 mb-2">
              Total Amount
            </h3>
            <p className="text-lg font-bold text-green-600">
              ₹{order.totalAmount}
            </p>
          </div>
        </div>
      </div>

      {/* Shipping Address */}
      <div className="mt-6 bg-white shadow-md rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Shipping Address
        </h3>
        <div className="p-4 bg-gray-50 rounded-md border">
          <p className="text-md font-semibold text-gray-700">
            {order?.shippingAddress?.name || ""}
          </p>
          <p className="text-sm text-gray-700">
            📞 {order?.shippingAddress?.phone || ""}
          </p>
          <p className="text-sm text-gray-600">
            {order?.shippingAddress?.address || ""}
          </p>
          <p className="text-sm text-gray-600">
            {order?.shippingAddress?.city || ""},{" "}
            {order?.shippingAddress?.state || ""} -{" "}
            {order?.shippingAddress?.pincode || ""}
          </p>
        </div>
      </div>

      {/* Product Details */}
      <div className="mt-6 bg-white shadow-md rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Products Ordered
        </h3>
        {order?.items?.map((item, index) => (
          <div
            key={index}
            className="flex items-center gap-6 border-b pb-4 mb-4"
          >
            {/* Product Image */}
            <img
              src={`${imageUrlPrefix}/${item.product.images[0]}`}
              alt={item.product.title}
              className="w-24 h-24 object-cover rounded-lg border"
            />

            {/* Product Info */}
            <div className="flex-1">
              <h4 className="font-semibold text-gray-800">{item.product.title}</h4>
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                <div
                  dangerouslySetInnerHTML={{
                    __html: item.product?.description || "",
                  }}
                />
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-lg font-bold text-green-600">
                  ₹{item.product.price}
                </span>
                <span className="text-sm text-gray-400 line-through">
                  ₹{item.product.strikePrice}
                </span>
              </div>
            </div>

            {/* Quantity */}
            <div className="text-md font-semibold text-gray-700">
              Qty: {item.quantity}
            </div>
          </div>
        ))}
      </div>

      <ModalCancel
        title="Order"
        open={isCancelOrder}
        id={orderId}
        onClose={cancelCloseHanler}
        onCancel={orderCancelHandler}
      />

      <ModalConfirm
        title="Order"
        open={isConfirmOrder}
        id={orderId}
        onClose={cancelConfirmHanler}
        onConfirm={orderConfirmedHandler}
      />
    </div>
  );
};

export default OrderDetails;
