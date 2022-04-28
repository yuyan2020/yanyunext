import axios from "axios";
import { useRouter } from "next/router";

const axiosInstance = axios.create({
  baseURL: "http://cms.chtoma.com/api",
});

axiosInstance.interceptors.request.use(
  (config) => {
    let token;
    if (typeof window !== "undefined") {
      token = localStorage.getItem("accessToken");
    } else {
      console.log("we are running on the server");
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("interceptors config=", config);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  function (response) {
    return response;
  },
  function (error) {
    let res = error.response;
    if (res.status == 401 || 403) {
      window.location.href = "http://localhost:3000";
    }
    console.error(
      "Looks like there was a problem. Status Code: “ + res.status"
    );
    return Promise.reject(error);
  }
);

export function login(data) {
  return axiosInstance.post("/login", data);
}

export function logout() {
  return axiosInstance.post("/logout");
}

export function getStudents(params) {
  return axiosInstance.get("/students", { params });
}

export function addStudent(params) {
  return axiosInstance.post("/students", params);
}

export function editStudent(params) {
  return axiosInstance.put("/students", params);
}

export function deleteStudent(id) {
  return axiosInstance.delete(`/students/${id}`);
}