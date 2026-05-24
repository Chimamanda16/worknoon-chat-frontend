import { create } from "zustand";

const useAuthStore = create((set) => ({
  user: null,

  setUser: (user) => set({ user }),

  logout: () => {
    localStorage.removeItem("userInfo");
    set({ user: null });
  },
}));

export default useAuthStore;