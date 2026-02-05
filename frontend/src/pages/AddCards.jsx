import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Input,
  Select,
  Card,
  LoadingSkeleton,
} from "../components/UI.jsx";
import { useSubmissions } from "../hooks/useSubmissions.js";
import { sessionStorageManager } from "../utils/cache.js";
import { Header, Container } from "../layouts/MainLayout.jsx";

export const AddCardsPage = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const { createSubmission, loading } = useSubmissions();
  const [speedDemon, setSpeedDemon] = useState(false);
  const [serviceTier, setServiceTier] = useState("THE_STANDARD");
  const [cards, setCards] = useState([
    { player: "", year: "", set: "", cardNumber: "", notes: "" },
  ]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const cached = sessionStorageManager.getSubmissionForm();
    if (cached) {
      setCards(cached.cards || cards);
      setServiceTier(cached.serviceTier || serviceTier);
      setSpeedDemon(cached.speedDemon || speedDemon);
    }
  }, []);

  const handleCardChange = (index, field, value) => {
    const newCards = [...cards];
    newCards[index] = { ...newCards[index], [field]: value };
    setCards(newCards);
  };

  const addCard = () => {
    setCards([
      ...cards,
      { player: "", year: "", set: "", cardNumber: "", notes: "" },
    ]);
  };

  const removeCard = (index) => {
    if (cards.length > 1) {
      setCards(cards.filter((_, i) => i !== index));
    }
  };

  const validateCards = () => {
    const newErrors = {};
    cards.forEach((card, i) => {
      if (!card.player) newErrors[`card_${i}_player`] = "Required";
      if (!card.year) newErrors[`card_${i}_year`] = "Required";
      if (!card.set) newErrors[`card_${i}_set`] = "Required";
      if (!card.cardNumber) newErrors[`card_${i}_cardNumber`] = "Required";
    });
    return newErrors;
  };

  const handleContinue = async () => {
    const cardErrors = validateCards();
    if (Object.keys(cardErrors).length > 0) {
      setErrors(cardErrors);
      return;
    }

    // Cache the submission form
    sessionStorageManager.setSubmissionForm({
      cards,
      serviceTier,
      speedDemon,
    });

    // Proceed to review
    navigate("/submission-review", {
      state: { cards, serviceTier, cardCount: cards.length },
    });
  };

  return (
    <div className="ng-app-shell ng-app-shell--dark">
      <Header user={user} onLogout={onLogout} />
      <Container>
        <div className="ng-section submission-page">
          <h1 className="ng-page-title">ADD CARDS</h1>

          <div className="submission-layout">
            <div className="submission-layout__primary">
              <Card className="submission-panel">
                <h2 className="submission-panel__title">ADD CARDS</h2>

                <div className="submission-panel__controls">
                  <Select
                    label="PLAYER"
                    value={serviceTier}
                    onChange={(e) => setServiceTier(e.target.value)}
                    options={[
                      { value: "SPEED_DEMON", label: "SPEED DEMON - $289" },
                      { value: "THE_STANDARD", label: "THE STANDARD - $49" },
                      { value: "BIG_MONEY", label: "BIG MONEY - $69" },
                    ]}
                  />

                  <Input label="YEAR" placeholder="2024" />

                  <Select
                    label="CARD #"
                    options={[
                      { value: "base", label: "Base Set" },
                      { value: "hologram", label: "Hologram" },
                      { value: "rare", label: "Rare" },
                    ]}
                  />

                  <Input
                    label="NOTES"
                    placeholder="Condition notes (optional)"
                  />
                </div>

                <Button
                  variant="primary"
                  className="ng-button--block submission-panel__cta"
                >
                  ADD CARD
                </Button>

                <div className="submission-panel__speed">
                  <div className="submission-panel__speed-label">
                    <span className="submission-panel__speed-icon">⚡</span>
                    <span className="submission-panel__speed-copy">
                      Speed Demon Mode (Cards only)
                    </span>
                  </div>
                  <button
                    onClick={() => setSpeedDemon(!speedDemon)}
                    className={`ng-toggle ${
                      speedDemon ? "ng-toggle--active" : ""
                    }`}
                    type="button"
                    aria-pressed={speedDemon}
                  >
                    <span className="ng-toggle__thumb" />
                  </button>
                </div>
                <p className="submission-panel__speed-helper">
                  Skip details, enter total cards
                </p>
              </Card>

              {cards.map((card, index) => (
                <Card key={index} className="submission-card-entry">
                  <div className="submission-card-entry__header">
                    <h3>Card #{index + 1}</h3>
                    {cards.length > 1 && (
                      <button
                        onClick={() => removeCard(index)}
                        className="submission-card-entry__remove"
                        type="button"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                  <div className="submission-card-entry__grid">
                    <Input
                      label="Player"
                      value={card.player}
                      onChange={(e) =>
                        handleCardChange(index, "player", e.target.value)
                      }
                      error={errors[`card_${index}_player`]}
                    />
                    <Input
                      label="Year"
                      value={card.year}
                      onChange={(e) =>
                        handleCardChange(index, "year", e.target.value)
                      }
                      error={errors[`card_${index}_year`]}
                    />
                    <Input
                      label="Set"
                      value={card.set}
                      onChange={(e) =>
                        handleCardChange(index, "set", e.target.value)
                      }
                      error={errors[`card_${index}_set`]}
                    />
                    <Input
                      label="Card #"
                      value={card.cardNumber}
                      onChange={(e) =>
                        handleCardChange(index, "cardNumber", e.target.value)
                      }
                      error={errors[`card_${index}_cardNumber`]}
                    />
                  </div>
                  <Input
                    label="Notes"
                    value={card.notes}
                    onChange={(e) =>
                      handleCardChange(index, "notes", e.target.value)
                    }
                    className="submission-card-entry__notes"
                  />
                </Card>
              ))}

              <Button
                variant="secondary"
                className="ng-button--block submission-panel__cta"
                onClick={addCard}
              >
                + ADD ANOTHER CARD
              </Button>
            </div>

            <div className="submission-layout__sidebar">
              <Card className="submission-sidebar">
                <h2 className="submission-sidebar__title">YOUR STACK</h2>
                <div className="submission-stack">
                  {cards.map((card, i) => (
                    <div key={i} className="submission-stack__item">
                      <p className="submission-stack__title">
                        {card.player || `Card ${i + 1}`}
                      </p>
                      {card.year && (
                        <p className="submission-stack__meta">{card.year}</p>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>

          <div className="submission-actions">
            <Button
              variant="primary"
              onClick={handleContinue}
              disabled={loading}
              className="submission-actions__button"
            >
              CONTINUE TO REVIEW →
            </Button>
            <Button variant="secondary" className="submission-actions__button">
              SAVE AND EXIT
            </Button>
          </div>
        </div>
      </Container>
    </div>
  );
};
