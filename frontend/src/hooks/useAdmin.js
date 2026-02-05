import { useState, useCallback } from "react";
import { apiCall } from "../utils/api.js";

export const useAdmin = () => {
  const [submissions, setSubmissions] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 50,
    total: 0,
  });

  const fetchSubmissions = useCallback(
    async (page = 1, status = null, paymentStatus = null) => {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        params.append("page", page);
        if (status) params.append("status", status);
        if (paymentStatus) params.append("paymentStatus", paymentStatus);

        const data = await apiCall(`/api/admin/submissions?${params}`);

        setSubmissions(data.submissions);
        setPagination(data.pagination);

        return data;
      } catch (err) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const updateSubmissionStatus = useCallback(
    async (submissionId, status) => {
      setLoading(true);
      setError(null);

      try {
        const data = await apiCall(
          `/api/admin/submissions/${submissionId}/status`,
          {
            method: "PATCH",
            body: JSON.stringify({ status }),
          },
        );

        // Invalidate submissions cache by refetching
        await fetchSubmissions(pagination.page);

        return data;
      } catch (err) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchSubmissions, pagination.page],
  );

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await apiCall("/api/admin/analytics");
      setAnalytics(data.analytics);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    submissions,
    analytics,
    loading,
    error,
    pagination,
    fetchSubmissions,
    updateSubmissionStatus,
    fetchAnalytics,
  };
};
