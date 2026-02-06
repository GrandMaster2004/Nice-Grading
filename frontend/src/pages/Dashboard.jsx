import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Card, LoadingSkeleton } from "../components/UI.jsx";
import { Header, Container } from "../layouts/MainLayout.jsx";
import { useSubmissions } from "../hooks/useSubmissions.js";

const StatusBadge = ({ value, tone = "status" }) => {
  const slug = value ? value.toLowerCase().replace(/\s+/g, "-") : "unknown";
  const toneClass = tone === "payment" ? "status-badge--payment" : "";

  return (
    <span className={`status-badge ${toneClass} status-badge--${slug}`}>
      {value}
    </span>
  );
};

const DashboardSummary = ({ summary, paymentSummary }) => {
  return (
    <Card className="dashboard-summary">
      <h2>CUSTOMER OVERVIEW</h2>
      <div className="dashboard-summary__grid">
        <div className="dashboard-summary__item">
          <span className="dashboard-summary__label">TOTAL SUBMISSIONS</span>
          <strong className="dashboard-summary__value">
            {summary.totalSubmissions}
          </strong>
        </div>
        <div className="dashboard-summary__item">
          <span className="dashboard-summary__label">TOTAL CARDS</span>
          <strong className="dashboard-summary__value">
            {summary.totalCards}
          </strong>
        </div>
        <div className="dashboard-summary__item">
          <span className="dashboard-summary__label">PENDING</span>
          <strong className="dashboard-summary__value">
            {summary.pendingSubmissions}
          </strong>
        </div>
        <div className="dashboard-summary__item">
          <span className="dashboard-summary__label">COMPLETED</span>
          <strong className="dashboard-summary__value">
            {summary.completedSubmissions}
          </strong>
        </div>
      </div>
      <div className="dashboard-summary__payments">
        <div>
          <span className="dashboard-summary__label">PAYMENT STATUS</span>
          <StatusBadge value={summary.paymentStatus} tone="payment" />
        </div>
        <div className="dashboard-summary__amounts">
          <div>
            <span>TOTAL</span>
            <strong>${paymentSummary.total.toFixed(2)}</strong>
          </div>
          <div>
            <span>PAID</span>
            <strong>${paymentSummary.paid.toFixed(2)}</strong>
          </div>
          <div>
            <span>REMAINING</span>
            <strong>${paymentSummary.remaining.toFixed(2)}</strong>
          </div>
        </div>
      </div>
    </Card>
  );
};

// Memoized table row component
const SubmissionRow = ({ submission }) => {
  const statusSlug = (value) =>
    value?.toLowerCase().replace(/\s+/g, "-") || "unknown";

  const getStatusClass = (status) =>
    `status-badge status-badge--${statusSlug(status)}`;

  const paymentStatus =
    submission.paymentStatus === "paid"
      ? "Paid"
      : submission.paymentStatus === "failed"
        ? "Failed"
        : "Pending";

  const statusValue = submission.submissionStatus?.toLowerCase() || "";
  const submissionStatus =
    submission.submissionStatus === "Completed"
      ? "Completed"
      : statusValue.includes("grading") ||
          statusValue.includes("review") ||
          statusValue.includes("received") ||
          statusValue.includes("ready") ||
          statusValue.includes("shipped")
        ? "In Review"
        : statusValue
          ? "Submitted"
          : "Draft";

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
        <span className={getStatusClass(paymentStatus)}>{paymentStatus}</span>
      </td>
      <td className="ng-table__cell">
        <span className={getStatusClass(submissionStatus)}>
          {submissionStatus}
        </span>
      </td>
    </tr>
  );
};

export const DashboardPage = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const { submissions, loading, fetchSubmissions } = useSubmissions();

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  const memoizedSubmissions = useMemo(() => {
    return submissions || [];
  }, [submissions]);

  const submissionSummary = useMemo(() => {
    const totalSubmissions = memoizedSubmissions.length;
    const totalCards = memoizedSubmissions.reduce(
      (sum, submission) => sum + (submission.cardCount || 0),
      0,
    );
    const completedSubmissions = memoizedSubmissions.filter(
      (submission) => submission.submissionStatus === "Completed",
    ).length;
    const pendingSubmissions = totalSubmissions - completedSubmissions;
    const paidCount = memoizedSubmissions.filter(
      (submission) => submission.paymentStatus === "paid",
    ).length;
    const paymentStatus =
      totalSubmissions === 0
        ? "Unpaid"
        : paidCount === totalSubmissions
          ? "Paid"
          : paidCount === 0
            ? "Unpaid"
            : "Partially Paid";

    return {
      totalSubmissions,
      totalCards,
      pendingSubmissions,
      completedSubmissions,
      paymentStatus,
    };
  }, [memoizedSubmissions]);

  const paymentSummary = useMemo(() => {
    const total = memoizedSubmissions.reduce(
      (sum, submission) => sum + (submission.pricing?.total || 0),
      0,
    );
    const paid = memoizedSubmissions.reduce((sum, submission) => {
      if (submission.paymentStatus === "paid") {
        return sum + (submission.pricing?.total || 0);
      }
      return sum;
    }, 0);

    return {
      total,
      paid,
      remaining: Math.max(total - paid, 0),
    };
  }, [memoizedSubmissions]);

  return (
    <div className="ng-app-shell ng-app-shell--dark dashboard-page">
      <Header user={user} onLogout={onLogout} />
      <Container>
        <div className="ng-section">
          <div className="page-header">
            <h1 className="ng-page-title">YOUR VAULT</h1>
            <Button variant="primary" onClick={() => navigate("/add-cards")}>
              START NEW SUBMISSION
            </Button>
          </div>

          <div className="dashboard-layout">
            <div className="dashboard-main">
              {loading ? (
                <LoadingSkeleton lines={6} />
              ) : (
                <>
                  <DashboardSummary
                    summary={submissionSummary}
                    paymentSummary={paymentSummary}
                  />

                  <Card className="dashboard-panel">
                    <h2>ALL SUBMISSIONS</h2>
                    <div className="ng-table-wrapper">
                      <table className="ng-table">
                        <thead>
                          <tr>
                            <th>SUBMISSION ID</th>
                            <th>SUBMISSION DATE</th>
                            <th>NUMBER OF CARDS</th>
                            <th>PAYMENT STATUS</th>
                            <th>SUBMISSION STATUS</th>
                          </tr>
                        </thead>
                        <tbody>
                          {memoizedSubmissions.length === 0 ? (
                            <tr className="ng-table__row">
                              <td className="ng-table__cell" colSpan={5}>
                                No submissions yet. Start by adding cards.
                              </td>
                            </tr>
                          ) : (
                            memoizedSubmissions.map((submission) => (
                              <SubmissionRow
                                key={submission._id}
                                submission={submission}
                              />
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </Card>
                </>
              )}
            </div>

            <aside className="dashboard-panel--aside">
              <Card className="dashboard-action-panel">
                <h2>ACTIONS</h2>
                <p className="dashboard-action-panel__copy">
                  Manage your submissions or start a new grading order.
                </p>
                <Button
                  variant="primary"
                  className="ng-button--block"
                  onClick={() => navigate("/add-cards")}
                >
                  START NEW SUBMISSION
                </Button>
                <Button
                  variant="secondary"
                  className="ng-button--block"
                  onClick={() => navigate("/payment")}
                >
                  PAYMENT OPTIONS
                </Button>
              </Card>
            </aside>
          </div>
        </div>
      </Container>
    </div>
  );
};
