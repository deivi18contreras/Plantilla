import axiosInstance from '@/plugins/axios'

export const getData = async (url, params = {}) => {
  const response = await axiosInstance.get(url, { params })
  return response.data
}

export const postData = async (url, data) => {
  const response = await axiosInstance.post(url, data)
  return response.data
}

export const putData = async (url, data) => {
  const response = await axiosInstance.put(url, data)
  return response.data
}

export const deleteData = async (url) => {
  const response = await axiosInstance.delete(url)
  return response.data
}
