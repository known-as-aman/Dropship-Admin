import { apiUrlPrefix } from "../config/url";

const headers = { "Content-Type": "application/json" };

export const getCall = async (endPoint, customHeaders = {}) => {
    try {
        let fetchedData = await fetch(`${apiUrlPrefix}${endPoint}`, {
            method: "GET",
            headers: { ...headers, ...customHeaders }
        });
        let parsedData = await fetchedData.json();
        return parsedData;
    } catch (error) {
        console.log(error);
        return null;
    }
}

export const postCall = async (endPoint, customHeaders = {}, body = {}) => {
    try {
        let fetchedData = await fetch(`${apiUrlPrefix}${endPoint}`, {
            method: "POST",
            headers: { ...headers, ...customHeaders },
            body: JSON.stringify(body)
        });
        let parsedData = await fetchedData.json();
        return parsedData;
    } catch (error) {
        console.log(error);
        return null;
    }
}

export const putCall = async (endPoint, customHeaders = {}, body = {}) => {
    try {
        let fetchedData = await fetch(`${apiUrlPrefix}${endPoint}`, {
            method: "PUT",
            headers: { ...headers, ...customHeaders },
            body: JSON.stringify(body)
        });
        let parsedData = await fetchedData.json();
        return parsedData;
    } catch (error) {
        console.log(error);
        return null;
    }
}

export const postFormDataCall = async (endPoint, customHeaders = {}, body = {}) => {
    try {
        const myHeaders = new Headers();
        for (let key in customHeaders) {
            myHeaders.append(key, customHeaders[key]);
        }
        const formdata = new FormData();
        for (let key in body) {
            formdata.append(key, body[key]);
        }
        let fetchedData = await fetch(`${apiUrlPrefix}${endPoint}`, {
            method: "POST",
            headers: myHeaders,
            body: formdata
        });
        let parsedData = await fetchedData.json();
        return parsedData;
    } catch (error) {
        console.log(error);
        return null;
    }
}

export const deleteCall = async (endPoint, customHeaders = {}) => {
    try {
        let fetchedData = await fetch(`${apiUrlPrefix}${endPoint}`, {
            method: "DELETE",
            headers: { ...headers, ...customHeaders }
        });
        let parsedData = await fetchedData.json();
        return parsedData;
    } catch (error) {
        console.log(error);
        return null;
    }
}