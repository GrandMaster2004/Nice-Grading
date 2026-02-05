import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button, Card } from "../components/UI.jsx";
import { Header, Container } from "../layouts/MainLayout.jsx";
import { usePayment } from "../hooks/usePayment.js";
import { useSubmissions } from "../hooks/useSubmissions.js";
import { sessionStorageManager } from "../utils/cache.js";

export const PaymentPage = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [paymentMethod, setPaymentMethod] = useState("pay_now");
  const [submissionData, setSubmissionData] = useState(null);
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const {
    payNow,
    payLater,
    confirmPayment,
    loading: paymentLoading,
  } = usePayment();
  const { createSubmission, loading: submissionLoading } = useSubmissions();

  useEffect(() => {
    const cached = sessionStorageManager.getSubmissionForm();
    if (cached) {
      setSubmissionData(cached);
    }
  }, []);

  const calculateTotal = () => {
    if (!submissionData) return 0;
    const tierPrices = {
      SPEED_DEMON: 289,
      THE_STANDARD: 49,
      BIG_MONEY: 69,
    };
    const basePrice = tierPrices[submissionData.serviceTier];
    const processingFee = Math.round(basePrice * 0.05 * 100) / 100;
    return basePrice + processingFee;
  };

  const handlePayment = async () => {
    if (!submissionData) return;

    try {
      // Create submission first
      const submission = await createSubmission({
        cards: submissionData.cards,
        cardCount: submissionData.cards.length,
        serviceTier: submissionData.serviceTier,
      });

      if (paymentMethod === "pay_now") {
        // Simulate Pay Now - in production would use Stripe
        await payNow(submission._id, "pm_card_visa");
      } else {
        // Simulate Pay Later
        await payLater(submission._id);
      }

      // Clear cache and navigate to confirmation
      sessionStorageManager.removeSubmissionForm();
      navigate("/confirmation", { state: { submissionId: submission._id } });
    } catch (error) {
      console.error("Payment error:", error);
    }
  };

  if (!submissionData) {
    return (
      <div className="ng-app-shell ng-app-shell--dark">
        <Header user={user} onLogout={onLogout} />
        <Container>
          <p className="ng-loading-screen__text">Loading...</p>
        </Container>
      </div>
    );
  }

  return (
    <div className="ng-app-shell ng-app-shell--dark payment-page">
      <Header user={user} onLogout={onLogout} />
      <Container>
        <div className="ng-section">
          <div className="payment-wrapper">
            <h1 className="ng-page-title payment-title">PAYMENT</h1>

            <div className="payment-grid">
              <Card className="payment-card">
                <h2>PAYMENT METHOD</h2>
                <div className="payment-options">
                  <label className="payment-option">
                    <input
                      type="radio"
                      name="method"
                      value="pay_now"
                      checked={paymentMethod === "pay_now"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <div>
                      <p>PAY NOW</p>
                      <span>
                        Charge card immediately. Processing begins right away.
                      </span>
                    </div>
                  </label>
                  <label className="payment-option">
                    <input
                      type="radio"
                      name="method"
                      value="pay_later"
                      checked={paymentMethod === "pay_later"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <div>
                      <p>PAY LATER</p>
                      <span>
                        Initial charge covers processing. Pay the rest when
                        grading is complete.
                      </span>
                    </div>
                  </label>
                </div>
              </Card>

              <Card className="payment-card">
                <h2>CARD DETAILS</h2>
                <div className="payment-fields">
                  <label className="payment-fields__label">CARD NUMBER</label>
                  <input
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    value={cardNumber}
                    onChange={(e) =>
                      setCardNumber(
                        e.target.value.replace(/\D/g, "").slice(0, 16),
                      )
                    }
                    className="payment-input"
                  />

                  <div className="payment-fields__row">
                    <div>
                      <label className="payment-fields__label">EXP DATE</label>
                      <input
                        type="text"
                        placeholder="MM/YY"
                        value={cardExpiry}
                        onChange={(e) => {
                          let val = e.target.value.replace(/\D/g, "");
                          if (val.length >= 2) {
                            val = val.slice(0, 2) + "/" + val.slice(2, 4);
                          }
                          setCardExpiry(val);
                        }}
                        className="payment-input"
                      />
                    </div>
                    <div>
                      <label className="payment-fields__label">CVC</label>
                      <input
                        type="text"
                        placeholder="123"
                        value={cardCvc}
                        onChange={(e) =>
                          setCardCvc(
                            e.target.value.replace(/\D/g, "").slice(0, 3),
                          )
                        }
                        className="payment-input"
                      />
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="payment-summary">
                <h2>ORDER SUMMARY</h2>
                <div className="payment-summary__rows">
                  <div>
                    <span>Service Tier:</span>
                    <strong>{submissionData.serviceTier}</strong>
                  </div>
                  <div>
                    <span>Cards:</span>
                    <strong>{submissionData.cards.length}</strong>
                  </div>
                  <div className="payment-summary__total">
                    <span>TOTAL:</span>
                    <strong>${calculateTotal().toFixed(2)}</strong>
                  </div>
                </div>
              </Card>

              <div className="payment-actions">
                <Button
                  variant="primary"
                  className="ng-button--block"
                  onClick={handlePayment}
                  disabled={
                    paymentLoading ||
                    submissionLoading ||
                    !cardNumber ||
                    !cardExpiry ||
                    !cardCvc
                  }
                >
                  {paymentLoading
                    ? "PROCESSING..."
                    : paymentMethod === "pay_now"
                      ? "PAY NOW"
                      : "SAVE & CONTINUE"}
                </Button>
                <Button
                  variant="secondary"
                  className="ng-button--block"
                  onClick={() => navigate("/add-cards")}
                  disabled={paymentLoading}
                >
                  BACK
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};
