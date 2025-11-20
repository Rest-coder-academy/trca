import { useEffect, useState } from "react";

export default function useFetch(apiFunction, params = null, deps = []) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchData() {
      setLoading(true);
      try {
        const response = params ? await apiFunction(params) : await apiFunction();
        if (isMounted) setData(response);
      } catch (err) {
        if (isMounted) setError(err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchData();

    return () => {
      isMounted = false; // cleanup to prevent memory leaks
    };
  }, deps);

  return { data, loading, error, setData };
}
