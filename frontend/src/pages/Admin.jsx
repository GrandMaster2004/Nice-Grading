import { useState, useEffect, useMemo } from "react";
import { Button, Card, Select, LoadingSkeleton } from "../components/UI.jsx";
import { Header, Container } from "../layouts/MainLayout.jsx";
import { useAdmin } from "../hooks/useAdmin.js";

const SubmissionRow = ({ submission, onStatusChange, loading }) => {
  const statusSlug = (value) =>
    value?.toLowerCase().replace(/\s+/g, "-") || "unknown";

  const getStatusClass = (status) =>
    `status-badge status-badge--${statusSlug(status)}`;

  const getPaymentClass = (status) =>
    `status-badge status-badge--${statusSlug(status)}`;

  return (
    <tr className="ng-table__row">
      <td className="ng-table__cell">{submission._id.slice(0, 8)}</td>
      <td className="ng-table__cell">
        {new Date(submission.createdAt).toLocaleDateString()}
      </td>
      <td className="ng-table__cell ng-table__cell--muted">
        {submission.userId?.email || "Unknown"}
      </td>
      <td className="ng-table__cell ng-table__cell--strong">
        {submission.cardCount}
      </td>
      <td className="ng-table__cell">
        <select
          value={submission.submissionStatus}
          onChange={(e) => onStatusChange(submission._id, e.target.value)}
          disabled={loading}
          className="admin-status-select"
        >
          <option>Created</option>
          <option>Awaiting Shipment</option>
          <option>Received</option>
          <option>In Grading</option>
          <option>Ready for Payment</option>
          <option>Shipped</option>
          <option>Completed</option>
        </select>
      </td>
      <td className="ng-table__cell">
        <span className={getPaymentClass(submission.paymentStatus)}>
          {submission.paymentStatus.toUpperCase()}
        </span>
      </td>
      <td className="ng-table__cell ng-table__cell--numeric">
        ${submission.pricing.total.toFixed(2)}
      </td>
    </tr>
  );
};

export const AdminPage = ({ user, onLogout }) => {
  const {
    submissions,
    analytics,
    loading,
    pagination,
    fetchSubmissions,
    updateSubmissionStatus,
    fetchAnalytics,
  } = useAdmin();

  const [statusFilter, setStatusFilter] = useState(null);
  const [paymentFilter, setPaymentFilter] = useState(null);

  useEffect(() => {
    fetchSubmissions(1, statusFilter, paymentFilter);
    fetchAnalytics();
  }, [statusFilter, paymentFilter]);

  const memoizedSubmissions = useMemo(() => {
    return submissions || [];
  }, [submissions]);

  const handleStatusChange = async (submissionId, newStatus) => {
    try {
      await updateSubmissionStatus(submissionId, newStatus);
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  return (
    <div className="ng-app-shell ng-app-shell--dark admin-page">
      <Header user={user} onLogout={onLogout} />
      <Container>
        <div className="ng-section">
          <h1 className="ng-page-title">ADMIN VAULT</h1>

          {/* Analytics Section */}
          {analytics && (
            <div className="admin-analytics">
              <Card>
                <p className="admin-analytics__label">Processing Queue</p>
                <p className="admin-analytics__value">
                  {analytics.inGradingCount}
                </p>
              </Card>
              <Card>
                <p className="admin-analytics__label">Pending Payment</p>
                <p className="admin-analytics__value">
                  {analytics.pendingPaymentCount}
                </p>
              </Card>
              <Card>
                <p className="admin-analytics__label">Avg. Throughput</p>
                <p className="admin-analytics__value">92%</p>
              </Card>
              <Card className="admin-analytics__highlight">
                <p className="admin-analytics__label">System Analytics</p>
                <p className="admin-analytics__value">
                  ${(analytics.totalRevenue / 100).toFixed(0)}
                </p>
              </Card>
            </div>
          )}

          {/* Main Table */}
          <Card className="admin-panel">
            <div className="admin-panel__header">
              <h2>SUBMISSIONS MANAGEMENT</h2>
              <div className="admin-filters">
                <Select
                  options={[
                    { value: "", label: "All Status" },
                    { value: "Created", label: "Created" },
                    { value: "In Grading", label: "In Grading" },
                    { value: "Ready for Payment", label: "Ready for Payment" },
                    { value: "Completed", label: "Completed" },
                  ]}
                  value={statusFilter || ""}
                  onChange={(e) => setStatusFilter(e.target.value || null)}
                  className="admin-filter"
                />
                <Select
                  options={[
                    { value: "", label: "All Payment" },
                    { value: "unpaid", label: "Unpaid" },
                    { value: "paid", label: "Paid" },
                  ]}
                  value={paymentFilter || ""}
                  onChange={(e) => setPaymentFilter(e.target.value || null)}
                  className="admin-filter"
                />
              </div>
            </div>

            {loading ? (
              <LoadingSkeleton lines={5} />
            ) : (
              <>
                <div className="ng-table-wrapper">
                  <table className="ng-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>DATE</th>
                        <th>CUSTOMER ID</th>
                        <th>CARDS</th>
                        <th>STATUS</th>
                        <th>PAYMENT</th>
                        <th className="ng-table__cell--numeric">AMOUNT</th>
                      </tr>
                    </thead>
                    <tbody>
                      {memoizedSubmissions.map((submission) => (
                        <SubmissionRow
                          key={submission._id}
                          submission={submission}
                          onStatusChange={handleStatusChange}
                          loading={loading}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="admin-pagination">
                  <p>
                    Page {pagination.page} of {pagination.totalPages} (
                    {pagination.total} total)
                  </p>
                  <div className="admin-pagination__actions">
                    <Button
                      variant="secondary"
                      onClick={() =>
                        fetchSubmissions(
                          Math.max(1, pagination.page - 1),
                          statusFilter,
                          paymentFilter,
                        )
                      }
                      disabled={pagination.page === 1}
                      className="admin-pagination__button"
                    >
                      ← PREV
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() =>
                        fetchSubmissions(
                          pagination.page + 1,
                          statusFilter,
                          paymentFilter,
                        )
                      }
                      disabled={pagination.page === pagination.totalPages}
                      className="admin-pagination__button"
                    >
                      NEXT →
                    </Button>
                  </div>
                </div>
              </>
            )}
          </Card>

          {/* Quick Actions */}
          <Card className="admin-quick-actions">
            <h2>QUICK ACTIONS</h2>
            <div className="admin-quick-actions__grid">
              <Button variant="secondary">💳 VIEW REPORTS</Button>
              <Button variant="secondary">⚙️ SAT NORT</Button>
              <Button variant="secondary">👥 MANAGE USERS</Button>
            </div>
          </Card>
        </div>
      </Container>
    </div>
  );
};
