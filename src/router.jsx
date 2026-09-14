import { createContext, useContext, useEffect, useState } from "react";

const RouterContext = createContext(null);

export function RouterProvider({ children }) {
  const [location, setLocation] = useState(window.location.pathname + window.location.search);
  const path = location.split('?')[0];
  useEffect(() => {
    const onPopState = () => setLocation(window.location.pathname + window.location.search);
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);
  const navigate = (next, { replace = false } = {}) => {
    window.history[replace ? "replaceState" : "pushState"]({}, "", next);
    setLocation(window.location.pathname + window.location.search);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  return (
    <RouterContext.Provider value={{ path, search: location.includes('?') ? location.slice(location.indexOf('?')) : '', navigate }}>
      {children}
    </RouterContext.Provider>
  );
}

export function useRouter() {
  return useContext(RouterContext);
}
