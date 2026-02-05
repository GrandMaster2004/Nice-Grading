import { useState, useCallback } from "react";
import { apiCall } from "../utils/api.js";
import { sessionStorageManager } from "../utils/cache.js";

export const useSubmissions = () => {
  const [submissions, setSubmissions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSubmissions = useCallback(async (skipCache = false) => {
    // Check cache first
    if (!skipCache) {
      const cached = sessionStorageManager.getSubmissions();
      if (cached) {
        setSubmissions(cached);
        return cached;
      }
    }

    setLoading(true);
    setError(null);

    try {
      const data = await apiCall("/api/submissions");
      sessionStorageManager.setSubmissions(data.submissions);
      setSubmissions(data.submissions);
      return data.submissions;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createSubmission = useCallback(async (submission) => {
    setLoading(true);
    setError(null);

    try {
      const data = await apiCall("/api/submissions", {
        method: "POST",
        body: JSON.stringify(submission),
      });

      // Invalidate submissions cache
      sessionStorageManager.remove(
        sessionStorageManager.CACHE_KEYS.SUBMISSIONS,
      );

      return data.submission;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    submissions,
    loading,
    error,
    fetchSubmissions,
    createSubmission,
  };
};
