import { createContext, useContext, useEffect, useState } from "react";

const RouterContext = createContext(null);

export function RouterProvider({ children }) {
  const [path, setPath] = useState(window.location.pathname);
  useEffect(() => {
    const onPopState = () => setPath(window.location.pathname);
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);
  const navigate = (next, { replace = false } = {}) => {
    window.history[replace ? "replaceState" : "pushState"]({}, "", next);
    setPath(new URL(next, window.location.origin).pathname);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  return (
    <RouterContext.Provider value={{ path, navigate }}>
      {children}
    </RouterContext.Provider>
  );
}

export function useRouter() {
  return useContext(RouterContext);
}
