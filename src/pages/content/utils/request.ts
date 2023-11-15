import axios from "axios";

const access_token = "ef608c2b8130e96f39629b06645d7721";
const request = axios.create({});
request.interceptors.request.use((config) => {
  return config;
});
request.interceptors.response.use((response) => {
  const { data } = response;
  return data;
});
export default request;
