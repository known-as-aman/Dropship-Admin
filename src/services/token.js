const key = "dropship-admin";

export const getLoginToken = () => {
    return localStorage.getItem(key) || "";
}

export const setLoginToken = (token) => {
    return localStorage.setItem(key, token);
}

export const clearLoginToken = () => {
    return localStorage.removeItem(key);
}