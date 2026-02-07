import { useState, useEffect, useMemo, useCallback } from "react";
import { Button, Card, Select, LoadingSkeleton } from "../components/UI.jsx";
import { Header, Container } from "../layouts/MainLayout.jsx";
import { LandingFooter } from "../components/LandingChrome.jsx";
import { useAdmin } from "../hooks/useAdmin.js";

const SubmissionRow = ({ submission, onStatusChange, isUpdating }) => {
  const statusSlug = (value) =>
    value?.toLowerCase().replace(/\s+/g, "-") || "unknown";

  const getStatusClass = (status) =>
    `status-badge status-badge--${statusSlug(status)}`;

  const getPaymentClass = (status) =>
    `status-badge status-badge--${statusSlug(status)}`;

  const pricePerCard = submission.cards?.[0]?.price || 0;
  const cardDetails = (submission.cards || []).map((card) => (
    <div key={`${card.player}-${card.cardNumber}`}>
      {card.player} • {card.year} • {card.set} • #{card.cardNumber} ($
      {card.price})
    </div>
  ));

  return (
    <tr className="ng-table__row">
      <td className="ng-table__cell">
        <div className="admin-cell-content">
          <div className="admin-customer-name">
            {submission.userId?.name || "Unknown"}
          </div>
          <div className="admin-customer-email">
            {submission.userId?.email || "N/A"}
          </div>
        </div>
      </td>
      <td className="ng-table__cell">{submission._id.slice(0, 8)}</td>
      <td className="ng-table__cell">
        {new Date(submission.createdAt).toLocaleDateString()}
      </td>
      <td className="ng-table__cell ng-table__cell--strong">
        {submission.cardCount}
      </td>
      <td className="ng-table__cell">
        <div className="admin-card-details">{cardDetails}</div>
      </td>
      <td className="ng-table__cell">${pricePerCard}</td>
      <td className="ng-table__cell">
        <select
          value={submission.submissionStatus}
          onChange={(e) => onStatusChange(submission._id, e.target.value)}
          disabled={isUpdating}
          className="admin-status-select"
          title="Click to change submission status"
        >
          <option>Created</option>
          <option>Awaiting Shipment</option>
          <option>Received</option>
          <option>In Grading</option>
          <option>Ready for Payment</option>
          <option>Shipped</option>
          <option>Completed</option>
        </select>
        {isUpdating && <span className="admin-updating">Saving...</span>}
      </td>
      <td className="ng-table__cell">
        <span className={getPaymentClass(submission.paymentStatus)}>
          {submission.paymentStatus === "unpaid"
            ? "Unpaid"
            : submission.paymentStatus === "paid"
              ? "Paid"
              : "Failed"}
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
    error,
    pagination,
    fetchSubmissions,
    updateSubmissionStatus,
    fetchAnalytics,
  } = useAdmin();

  const [statusFilter, setStatusFilter] = useState(null);
  const [paymentFilter, setPaymentFilter] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [updateError, setUpdateError] = useState(null);

  // Fetch submissions and analytics on mount and when filters change
  useEffect(() => {
    fetchSubmissions(1, statusFilter, paymentFilter);
    fetchAnalytics();
  }, [statusFilter, paymentFilter, fetchSubmissions, fetchAnalytics]);

  const memoizedSubmissions = useMemo(() => {
    return submissions || [];
  }, [submissions]);

  const handleStatusChange = useCallback(
    async (submissionId, newStatus) => {
      setUpdatingId(submissionId);
      setUpdateError(null);

      try {
        await updateSubmissionStatus(submissionId, newStatus);
      } catch (error) {
        const errorMsg =
          error.message || "Failed to update status. Please try again.";
        setUpdateError(errorMsg);
        console.error("Error updating status:", error);
        // Clear error after 5 seconds
        setTimeout(() => setUpdateError(null), 5000);
      } finally {
        setUpdatingId(null);
      }
    },
    [updateSubmissionStatus],
  );

  return (
    <div className="ng-app-shell ng-app-shell--dark admin-page">
      <Header user={user} onLogout={onLogout} />
      <Container>
        <div className="ng-section">
          <h1 className="ng-page-title">ADMIN VAULT</h1>

          {/* Error Alert */}
          {(error || updateError) && (
            <div className="admin-error-alert">
              <span className="admin-error-icon">⚠️</span>
              <div className="admin-error-message">
                <p className="admin-error-text">{updateError || error}</p>
              </div>
            </div>
          )}

          {/* Analytics Section */}
          {analytics && (
            <div className="admin-analytics">
              <Card>
                <p className="admin-analytics__label">Total Submissions</p>
                <p className="admin-analytics__value">
                  {analytics.totalSubmissions}
                </p>
              </Card>
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
                <p className="admin-analytics__label">Paid Revenue</p>
                <p className="admin-analytics__value">
                  ${analytics.paidRevenue.toFixed(2)}
                </p>
              </Card>
              <Card>
                <p className="admin-analytics__label">Unpaid Revenue</p>
                <p className="admin-analytics__value">
                  ${analytics.unpaidRevenue.toFixed(2)}
                </p>
              </Card>
              <Card className="admin-analytics__highlight">
                <p className="admin-analytics__label">Total Revenue</p>
                <p className="admin-analytics__value">
                  ${analytics.totalRevenue.toFixed(2)}
                </p>
              </Card>
            </div>
          )}

          {/* Main Submissions Table */}
          <Card className="admin-panel">
            <div className="admin-panel__header">
              <h2>ALL SUBMISSIONS</h2>
              <div className="admin-filters">
                <Select
                  options={[
                    { value: "", label: "All Status" },
                    { value: "Created", label: "Created" },
                    { value: "Awaiting Shipment", label: "Awaiting Shipment" },
                    { value: "Received", label: "Received" },
                    { value: "In Grading", label: "In Grading" },
                    {
                      value: "Ready for Payment",
                      label: "Ready for Payment",
                    },
                    { value: "Shipped", label: "Shipped" },
                    { value: "Completed", label: "Completed" },
                  ]}
                  value={statusFilter || ""}
                  onChange={(e) => setStatusFilter(e.target.value || null)}
                  className="admin-filter"
                />
                <Select
                  options={[
                    { value: "", label: "All Payment" },
                    { value: "paid", label: "Paid" },
                    { value: "unpaid", label: "Unpaid" },
                    { value: "failed", label: "Failed" },
                  ]}
                  value={paymentFilter || ""}
                  onChange={(e) => setPaymentFilter(e.target.value || null)}
                  className="admin-filter"
                />
              </div>
            </div>

            {loading ? (
              <LoadingSkeleton lines={5} />
            ) : memoizedSubmissions.length === 0 ? (
              <div className="admin-empty-state">
                <p>No submissions found. Try adjusting your filters.</p>
              </div>
            ) : (
              <>
                <div className="ng-table-wrapper">
                  <table className="ng-table">
                    <thead>
                      <tr>
                        <th>CUSTOMER</th>
                        <th>ID</th>
                        <th>DATE</th>
                        <th>CARDS</th>
                        <th>CARD DETAILS</th>
                        <th>PRICE/CARD</th>
                        <th>SUBMISSION STATUS</th>
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
                          isUpdating={updatingId === submission._id}
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
        </div>
      </Container>
      <LandingFooter />
    </div>
  );
};
