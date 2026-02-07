import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Card } from "../components/UI.jsx";
import { Header, Container } from "../layouts/MainLayout.jsx";
import { LandingFooter } from "../components/LandingChrome.jsx";
import { sessionStorageManager } from "../utils/cache.js";

export const SubmissionReviewPage = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(null);
  const [pricing, setPricing] = useState(null);

  useEffect(() => {
    const cached = sessionStorageManager.getSubmissionForm();
    if (cached) {
      setFormData(cached);
      const tier = {
        SPEED_DEMON: 289,
        THE_STANDARD: 49,
        BIG_MONEY: 69,
      }[cached.serviceTier];
      const processingFee = Math.round(tier * 0.05 * 100) / 100;
      setPricing({
        basePrice: tier,
        processingFee,
        total: tier + processingFee,
      });
    }
  }, []);

  const handleProceedToPayment = () => {
    navigate("/payment", { state: { formData, pricing } });
  };

  const handleSaveAndExit = () => {
    sessionStorageManager.removeSubmissionForm();
    navigate("/dashboard");
  };

  if (!formData) {
    return (
      <div className="ng-app-shell ng-app-shell--dark">
        <Header user={user} onLogout={onLogout} />
        <Container>
          <p className="ng-loading-screen__text">Loading...</p>
        </Container>
        <LandingFooter />
      </div>
    );
  }

  return (
    <div className="ng-app-shell ng-app-shell--dark review-page">
      <Header user={user} onLogout={onLogout} />
      <Container>
        <div className="ng-section">
          <h1 className="ng-page-title">SUBMISSION REVIEW</h1>

          <div className="review-grid">
            <Card className="review-summary">
              <h2>ORDER SUMMARY</h2>
              <div className="review-summary__content">
                <div>
                  <p>NUMBER OF CARDS:</p>
                  <span>
                    {(formData.cardCount ?? formData.cards.length) || 0} cards
                  </span>
                </div>
                {formData.cards?.length > 0 && (
                  <div>
                    <p>(OPTIONAL) CARD LIST:</p>
                    <div className="review-summary__list">
                      {formData.cards.map((card, i) => (
                        <p key={i}>
                          {card.player}, {card.year}, {card.set} #
                          {card.cardNumber}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
                {pricing && (
                  <div className="review-summary__pricing">
                    <p>PRICING CALCULATION:</p>
                    <span>Service Tier: {formData.serviceTier}</span>
                    <span>Base Price: ${pricing.basePrice}</span>
                    <span>Processing Fee: ${pricing.processingFee}</span>
                    <div className="review-summary__total">
                      FINAL ORDER TOTAL: ${pricing.total}
                      <em>ESTIMATED</em>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            <Card className="review-details">
              <h2>SUMMARY</h2>
              <div className="review-details__list">
                {formData.cards?.length > 0 ? (
                  formData.cards.map((card, i) => (
                    <div className="review-details__item" key={i}>
                      <p>{card.player}</p>
                      <span>
                        {card.year} • {card.set} • #{card.cardNumber}
                      </span>
                      {card.notes && <small>{card.notes}</small>}
                    </div>
                  ))
                ) : (
                  <div className="review-details__item">
                    <p>Cards listed by total count only.</p>
                    <span>Total cards: {(formData.cardCount ?? 0) || 0}</span>
                  </div>
                )}
              </div>
            </Card>
          </div>

          <div className="review-actions">
            <Button
              variant="primary"
              onClick={handleProceedToPayment}
              className="review-actions__button"
            >
              PROCEED TO PAYMENT →
            </Button>
            <Button
              variant="secondary"
              className="review-actions__button"
              onClick={handleSaveAndExit}
            >
              SAVE AND EXIT
            </Button>
          </div>
        </div>
      </Container>
      <LandingFooter />
    </div>
  );
};
