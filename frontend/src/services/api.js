import axios from "axios";

const API = axios.create({
  baseURL: "https://pharmacy-emr-rose.vercel.app/",
});

export default API;
