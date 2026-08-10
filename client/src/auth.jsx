import { createContext, useContext } from 'react';

// 本地模式：无需注册登录，学习进度保存在当前设备
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const user = { name: 'Gast' };
  return <AuthContext.Provider value={{ user }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
