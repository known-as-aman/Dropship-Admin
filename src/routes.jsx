import Dashboard from "./pages/admin/dashboard";
import AddCategory from "./pages/admin/category/addCategory";
import ListCategory from "./pages/admin/category/listCategory";
import AddProduct from "./pages/admin/product/addProduct";
import ListProduct from "./pages/admin/product/listProduct";
import Login from "./pages/auth/login";
import AddPage from "./pages/admin/static-page/add-page";
import ListPage from "./pages/admin/static-page/list-page";
import State from "./pages/admin/location/state";
import City from "./pages/admin/location/city";
import Pincode from "./pages/admin/location/pincode";
import OrderList from "./pages/admin/order/order-list";

// const icon = {
//   className: "w-5 h-5 text-inherit",
// };

const routes = [
  {
    title: "admin",
    layout: "admin",
    pages: [
      {
        name: "dashboard",
        path: "/dashboard",
        element: <Dashboard />,
        subPages: [],
      },
      {
        name: "category",
        subPages: [
          {
            name: "Add Category",
            path: "/add-category",
            element: <AddCategory />,
          },
          {
            name: "List Category",
            path: "/list-category",
            element: <ListCategory />,
          },
        ],
      },
      {
        name: "product",
        subPages: [
          {
            name: "Add Product",
            path: "/add-product",
            element: <AddProduct />,
          },
          {
            name: "List Product",
            path: "/list-product",
            element: <ListProduct />,
          },
        ],
      },
      {
        name: "location",
        subPages: [
          {
            name: "State",
            path: "/state",
            element: <State />,
          },
          {
            name: "City",
            path: "/city",
            element: <City />,
          },
          {
            name: "Pincode",
            path: "/pincode",
            element: <Pincode />,
          },
        ],
      },
      {
        name: "static page",
        subPages: [
          {
            name: "Add Page",
            path: "/add-page",
            element: <AddPage />,
          },
          {
            name: "List Page",
            path: "/list-page",
            element: <ListPage />,
          },
        ],
      },
      {
        name: "order page",
        subPages: [
          {
            name: "Order List",
            path: "/order-list",
            element: <OrderList/>,
          },
        ],
      },
    ],
  },
  {
    title: "auth",
    layout: "auth",
    pages: [
      {
        name: "login",
        path: "/login",
        element: <Login />,
        subPages: [],
      },
    ],
  },
];

export default routes;
