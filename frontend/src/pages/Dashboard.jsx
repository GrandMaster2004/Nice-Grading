import { useState, useEffect, useMemo } from "react";
import { Button, Card, LoadingSkeleton } from "../components/UI.jsx";
import { Header, Container } from "../layouts/MainLayout.jsx";
import { useSubmissions } from "../hooks/useSubmissions.js";

// Memoized table row component
const SubmissionRow = ({ submission }) => {
  const statusSlug = (value) =>
    value?.toLowerCase().replace(/\s+/g, "-") || "unknown";

  const getStatusClass = (status) =>
    `status-badge status-badge--${statusSlug(status)}`;

  return (
    <tr className="ng-table__row">
      <td className="ng-table__cell">{submission._id.slice(0, 8)}</td>
      <td className="ng-table__cell">
        {new Date(submission.createdAt).toLocaleDateString()}
      </td>
      <td className="ng-table__cell ng-table__cell--strong">
        {submission.cardCount}
      </td>
      <td className="ng-table__cell">
        <span className={getStatusClass(submission.submissionStatus)}>
          {submission.submissionStatus}
        </span>
      </td>
      <td className="ng-table__cell">
        <span className={getStatusClass(submission.paymentStatus)}>
          {submission.paymentStatus.toUpperCase()}
        </span>
      </td>
      <td className="ng-table__cell ng-table__cell--numeric">
        ${submission.pricing.total}
      </td>
    </tr>
  );
};

export const DashboardPage = ({ user, onLogout }) => {
  const { submissions, loading, fetchSubmissions } = useSubmissions();

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const memoizedSubmissions = useMemo(() => {
    return submissions || [];
  }, [submissions]);

  return (
    <div className="ng-app-shell ng-app-shell--dark dashboard-page">
      <Header user={user} onLogout={onLogout} />
      <Container>
        <div className="ng-section">
          <div className="page-header">
            <h1 className="ng-page-title">YOUR VAULT</h1>
            <Button variant="primary">START NEW SUBMISSION</Button>
          </div>

          {loading ? (
            <LoadingSkeleton lines={5} />
          ) : (
            <Card className="dashboard-panel">
              <h2>CUSTOMER DASHBOARD</h2>

              {memoizedSubmissions.length === 0 ? (
                <p className="dashboard-panel__empty">
                  No submissions yet. Start by adding cards.
                </p>
              ) : (
                <div className="ng-table-wrapper">
                  <table className="ng-table">
                    <thead>
                      <tr>
                        <th>SUBMISSION ID</th>
                        <th>DATE</th>
                        <th>GRATALS</th>
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
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          )}

          <div className="dashboard-payment">
            <Button variant="secondary" className="ng-button--block">
              PAYMENT OPTIONS
            </Button>
          </div>
        </div>
      </Container>
    </div>
  );
};
