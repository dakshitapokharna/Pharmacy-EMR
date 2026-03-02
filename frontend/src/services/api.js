import axios from "axios";

const API = axios.create({
  baseURL: "https://pharmacy-emr1.onrender.com/docs"
});

export default API;
