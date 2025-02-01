// import axios from "axios";

// const axiosInstance = axios.create({
//   baseURL:
//     import.meta.mode === "development" ? "http://localhost:5001/api" : "/api",
//   withCredentials: true // send cookies to the server
// });
// console.log("Axios Base URL set to:", axiosInstance.defaults.baseURL);
// export default axiosInstance;

// import axios from "axios";

// const axiosInstance = axios.create({
//   baseURL: "http://localhost:5001/api", // ✅ Ensure this matches backend port
//   withCredentials: true, // ✅ Required for authentication
  // headers: {
  //   "Content-Type": "application/json", // ✅ Ensure headers are correctly sent
  // },
// });
// console.log("Axios Base URL set to:", axiosInstance.defaults.baseURL);

// export default axiosInstance;


import axios from "axios";

const axiosInstance = axios.create({
  baseURL:
    import.meta.env.MODE === "development"
      ? "http://localhost:5001/api"
      : "https://your-backend.onrender.com/api", // Explicit production backend URL
  withCredentials: true // Allow cookies
});

console.log("Current Mode:", import.meta.env.MODE);
console.log("Axios Base URL:", axiosInstance.defaults.baseURL);

export default axiosInstance;
