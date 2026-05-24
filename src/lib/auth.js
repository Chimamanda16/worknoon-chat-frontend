export const getUser = () => {
  if (typeof window === "undefined") return null;

  const data = localStorage.getItem("userInfo");
  return data ? JSON.parse(data) : null;
};

export const logoutUser = () => {
  localStorage.removeItem("userInfo");
};