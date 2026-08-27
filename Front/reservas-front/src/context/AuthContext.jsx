import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(() => {
  const usuarioSalvo = localStorage.getItem("usuario");

  if (!usuarioSalvo || usuarioSalvo === "undefined") {
    return null;
  }

  return JSON.parse(usuarioSalvo);
});

  const [token, setToken] = useState(() => {
  const tokenSalvo = localStorage.getItem("token");

  if (!tokenSalvo || tokenSalvo === "undefined" || tokenSalvo === "null") {
    return null;
  }

  return tokenSalvo;
});

  function login(tokenRecebido, usuarioRecebido) {
    localStorage.setItem("token", tokenRecebido);

    localStorage.setItem(
      "usuario",
      JSON.stringify(usuarioRecebido)
    );

    setToken(tokenRecebido);
    setUsuario(usuarioRecebido);
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");

    setToken(null);
    setUsuario(null);
  }

  return (
    <AuthContext.Provider
      value={{
        autenticado: Boolean(token),
        login,
        logout,
        usuario,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}