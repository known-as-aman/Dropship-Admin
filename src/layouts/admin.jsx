import React, { useEffect, useState } from "react";
import routes from "../routes";
import { Link, Route, Routes, useNavigate } from "react-router-dom";
import { ArrowLeftIcon, ChevronDownIcon } from "@heroicons/react/20/solid";
import Navbar from "../Components/navbar/Navbar";
import { TbPoint } from "react-icons/tb";
import Breadcrumb from "../Components/breadcrumb/Breadcrumb";
import { getLoginToken } from "../services/token";
import OrderDetails from "../pages/admin/order/order-details";

const Admin = () => {
  const token = getLoginToken();
  const navigate = useNavigate();
  const currentPath = window.location.pathname;

  const [sidebarOpen, setSidebarOpen] = useState(true);

  const openAccordion = (e) => {
    let btn = e.currentTarget;
    let ul = btn.nextSibling;
    let classList = ul.classList;

    if (classList.contains("hidden")) {
      ul.classList.remove("hidden");
      ul.classList.add("flex");
      btn.lastChild.classList.add("rotate-180");
      btn.lastChild.classList.remove("rotate-0");
    } else {
      ul.classList.add("hidden");
      ul.classList.remove("flex");
      btn.lastChild.classList.add("rotate-0");
      btn.lastChild.classList.remove("rotate-180");
    }
  };

  const checkLogin = () => {
    if (!token) navigate("/auth/login");
  };

  useEffect(() => {
    checkLogin();
  }, []);

  return (
    <main className="h-screen flex justify-between relative">
      {/* SIDEBAR */}
      <div
        className={`${
          sidebarOpen ? "left-0" : "-left-[300px]"
        } absolute top-0 bg-white w-[300px] flex flex-col transition-all duration-500 z-30`}
      >
        <div className="w-full h-[80px] flex items-center justify-center relative">
          <h1 className="text-xl font-medium text-gray-800">Admin</h1>
          {sidebarOpen && (
            <button
              type="button"
              className="absolute -right-16 top-3 hover:bg-gray-200 bg-white p-3 rounded-full lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <ArrowLeftIcon className="size-7" />
            </button>
          )}
        </div>

        <div className="px-2 pb-2 w-full h-[calc(100vh-80px)]">
          {routes?.map(
            ({ layout, pages }) =>
              layout === "admin" && (
                <ul
                  className="flex flex-col gap-2 px-6 size-full overflow-y-auto"
                  key={layout}
                >
                  {pages.map(({ name, path, subPages }) => (
                    <li className="w-full rounded-sm" key={name}>
                      {subPages && subPages.length > 0 ? (
                        <>
                          <button
                            type="button"
                            className="bg-gray-200 hover:bg-blue-500 w-full rounded-md p-2 hover:text-white text-md text-gray-600 font-medium flex justify-between items-center"
                            onClick={(e) => openAccordion(e)}
                          >
                            <span className="capitalize">{name}</span>
                            <ChevronDownIcon className="size-5 rotate-0" />
                          </button>
                          <ul className="flex-col gap-1 mt-2 px-2 hidden">
                            {subPages.map((item) => (
                              <li
                                className="rounded-sm py-1 px-4"
                                key={item.name}
                              >
                                <Link
                                  className="text-gray-600 flex gap-2 items-center"
                                  to={`/${layout}${item.path}`}
                                  onMouseEnter={(e) => {
                                    if (
                                      `/${layout}${item.path}` !== currentPath
                                    ) {
                                      e.currentTarget.firstChild.setAttribute(
                                        "fill",
                                        "#1e88e5"
                                      );
                                      e.currentTarget.firstChild.setAttribute(
                                        "stroke",
                                        "#1e88e5"
                                      );
                                    }
                                  }}
                                  onMouseLeave={(e) => {
                                    if (
                                      `/${layout}${item.path}` !== currentPath
                                    ) {
                                      e.currentTarget.firstChild.setAttribute(
                                        "fill",
                                        "white"
                                      );
                                      e.currentTarget.firstChild.setAttribute(
                                        "stroke",
                                        "black"
                                      );
                                    }
                                  }}
                                >
                                  {`/${layout}${item.path}` === currentPath ? (
                                    <TbPoint fill="#1e88e5" stroke="#1e88e5" />
                                  ) : (
                                    <TbPoint fill="white" stroke="black" />
                                  )}
                                  {item.name}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </>
                      ) : (
                        <Link
                          to={`/${layout}${path}`}
                          className="bg-gray-200 hover:bg-blue-500 w-full hover:text-white rounded-md p-2 text-md text-gray-600 font-medium flex justify-between"
                        >
                          <span className="capitalize">{name}</span>
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              )
          )}
        </div>
      </div>

      {/* MAIN SCREEN */}
      <div
        className={`${
          sidebarOpen ? "lg:w-[calc(100%-300px)]" : "lg:w-full"
        } bg-[#f4f7fa] w-full px-6 pt-4 flex flex-col gap-4 overflow-y-auto h-screen transition-all duration-500 ml-auto`}
      >
        <div className="rounded-lg w-full">
          <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        </div>

        <div className="bg-white px-8 py-6 rounded-xl shadow-xl">
          <Routes>
            {routes?.map(
              ({ layout, pages }) =>
                layout === "admin" &&
                pages?.map(({ path, element, subPages }) => {
                  return subPages && subPages.length > 0 ? (
                    subPages.map((item) => (
                      <Route exact path={item.path} element={item.element} />
                    ))
                  ) : (
                    <Route exact path={path} element={element} />
                  );
                })
            )}

            <Route exact path="/order-details" element={<OrderDetails />} />
          </Routes>
        </div>
      </div>
    </main>
  );
};

export default Admin;
