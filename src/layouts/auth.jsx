import React from "react";
import routes from "../routes";

const Auth = () => {
  const pathArr = window.location.pathname.split("/");
  const lastPath = pathArr[pathArr.length - 1];

  return (
    <main className="w-screen h-screen overflow-hidden">
      {routes.map(
        ({ layout, pages }) =>
          layout === "auth" &&
          pages.map(
            ({ path, element }) =>
              path === `/${lastPath}` && <div key={path}>{element}</div>
          )
      )}
    </main>
  );
};

export default Auth;
