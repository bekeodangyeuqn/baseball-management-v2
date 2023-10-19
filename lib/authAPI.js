import axiosClient from "./axiosClient";

export const login = async (credentials) => {
  const response = await axiosClient.post("/login", credentials);
  if (!response) return;

  const userCredential = response;

  return {
    id: userCredential.id,
    email: userCredential.email,
    role: userCredential.role,
  };
};
