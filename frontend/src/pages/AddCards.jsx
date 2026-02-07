import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Input, Card } from "../components/UI.jsx";
import { sessionStorageManager } from "../utils/cache.js";
import { Header, Container } from "../layouts/MainLayout.jsx";
import { LandingFooter } from "../components/LandingChrome.jsx";

export const AddCardsPage = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [cards, setCards] = useState([]);
  const [selectedPrice, setSelectedPrice] = useState(null);
  const [cardForm, setCardForm] = useState({
    player: "",
    year: "",
    set: "",
    cardNumber: "",
    notes: "",
  });
  const [errors, setErrors] = useState({});
  const [editingIndex, setEditingIndex] = useState(null);
  const serviceTier = "THE_STANDARD";

  useEffect(() => {
    const cached = sessionStorageManager.getSubmissionForm();
    if (cached) {
      setCards(cached.cards || []);
      setSelectedPrice(cached.selectedPrice ?? null);
    }
  }, []);

  const handleFieldChange = (field, value) => {
    setCardForm((prev) => ({ ...prev, [field]: value }));
  };

  const validateCardForm = () => {
    const newErrors = {};
    if (!cardForm.player) newErrors.player = "Required";
    if (!cardForm.year) newErrors.year = "Required";
    if (!cardForm.set) newErrors.set = "Required";
    if (!cardForm.cardNumber) newErrors.cardNumber = "Required";
    return newErrors;
  };

  const handleAddOrUpdate = () => {
    if (!selectedPrice) {
      setErrors((prev) => ({
        ...prev,
        price: "Select a price before adding cards",
      }));
      return;
    }

    const formErrors = validateCardForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setErrors({});

    const cardPayload = {
      ...cardForm,
      price: selectedPrice,
    };

    if (editingIndex !== null) {
      // Update existing card
      setCards((prev) => {
        const updated = [...prev];
        updated[editingIndex] = cardPayload;
        return updated;
      });
      setEditingIndex(null);
    } else {
      // Add new card
      setCards((prev) => [...prev, cardPayload]);
    }

    setCardForm({
      player: "",
      year: "",
      set: "",
      cardNumber: "",
      notes: "",
    });
  };

  const handleEditCard = (index) => {
    const card = cards[index];
    setCardForm(card);
    setSelectedPrice(card.price);
    setEditingIndex(index);
    setErrors({});
    // Scroll to form
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setCardForm({
      player: "",
      year: "",
      set: "",
      cardNumber: "",
      notes: "",
    });
    setErrors({});
  };

  const canContinue = useMemo(() => {
    return cards.length > 0 && Boolean(selectedPrice);
  }, [cards.length, selectedPrice]);

  const handleContinue = () => {
    if (!canContinue) {
      setErrors((prev) => ({
        ...prev,
        submit: cards.length === 0 ? "Add at least one card" : "Select a price",
      }));
      return;
    }

    sessionStorageManager.setSubmissionForm({
      cards,
      cardCount: cards.length,
      serviceTier,
      selectedPrice,
    });

    navigate("/submission-review", {
      state: {
        cards,
        serviceTier,
        cardCount: cards.length,
        selectedPrice,
      },
    });
  };

  const handleSaveAndExit = () => {
    sessionStorageManager.setSubmissionForm({
      cards,
      cardCount: cards.length,
      serviceTier,
      selectedPrice,
    });
    navigate("/dashboard");
  };

  const handlePriceSelect = (price) => {
    setSelectedPrice(price);
    setErrors((prev) => ({ ...prev, price: undefined, submit: undefined }));
    setCards((prev) =>
      prev.map((card) => ({
        ...card,
        price,
      })),
    );
  };

  return (
    <div className="ng-app-shell ng-app-shell--dark add-cards-page">
      <Header user={user} onLogout={onLogout} />
      <Container>
        <div className="ng-section">
          <h1 className="ng-page-title add-cards-page__title">ADD CARDS</h1>
          <div className="add-cards__container add-cards__container--split">
            <div className="add-cards__left">
              <Card className="add-cards__panel">
                <h2>{editingIndex !== null ? "EDIT CARD" : "ADD A CARD"}</h2>
                <div className="add-cards__form">
                  <Input
                    label="PLAYER"
                    placeholder="Player name"
                    value={cardForm.player}
                    onChange={(e) =>
                      handleFieldChange("player", e.target.value)
                    }
                    error={errors.player}
                  />
                  <Input
                    label="YEAR"
                    placeholder="2024"
                    value={cardForm.year}
                    onChange={(e) => handleFieldChange("year", e.target.value)}
                    error={errors.year}
                  />
                  <Input
                    label="SET"
                    placeholder="Set name"
                    value={cardForm.set}
                    onChange={(e) => handleFieldChange("set", e.target.value)}
                    error={errors.set}
                  />
                  <Input
                    label="CARD #"
                    placeholder="Card number"
                    value={cardForm.cardNumber}
                    onChange={(e) =>
                      handleFieldChange("cardNumber", e.target.value)
                    }
                    error={errors.cardNumber}
                  />
                  <Input
                    label="NOTES (OPTIONAL)"
                    placeholder="Notes"
                    value={cardForm.notes}
                    onChange={(e) => handleFieldChange("notes", e.target.value)}
                  />
                  <div className="add-cards__form-buttons">
                    <Button
                      variant="primary"
                      className="ng-button--block"
                      onClick={handleAddOrUpdate}
                    >
                      {editingIndex !== null ? "SAVE CHANGES" : "ADD CARD"}
                    </Button>
                    {editingIndex !== null && (
                      <Button
                        variant="secondary"
                        className="ng-button--block"
                        onClick={handleCancelEdit}
                      >
                        CANCEL
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            </div>

            <div className="add-cards__right">
              <Card className="add-cards__list">
                <h2>ADDED CARDS</h2>
                {cards.length === 0 ? (
                  <p className="add-cards__empty">No cards added yet.</p>
                ) : (
                  <div className="add-cards__stack">
                    {cards.map((card, index) => (
                      <div className="add-cards__item" key={index}>
                        <div>
                          <p className="add-cards__item-title">{card.player}</p>
                          <p className="add-cards__item-meta">
                            {card.year} • {card.set} • #{card.cardNumber}
                          </p>
                          <p className="add-cards__item-price">
                            ${card.price} selected
                          </p>
                        </div>
                        <div className="add-cards__item-actions">
                          <button
                            type="button"
                            className="add-cards__action add-cards__action--primary"
                            onClick={() => handleEditCard(index)}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="add-cards__action add-cards__action--danger"
                            onClick={() => handleDeleteCard(index)}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              <Card className="add-cards__pricing">
                <h2>CHOOSE YOUR PRICE</h2>
                <div className="add-cards__pricing-options">
                  {[5, 10, 20].map((price) => (
                    <button
                      key={price}
                      type="button"
                      className={`add-cards__price-option${
                        selectedPrice === price
                          ? " add-cards__price-option--active"
                          : ""
                      }`}
                      onClick={() => handlePriceSelect(price)}
                    >
                      ${price}
                    </button>
                  ))}
                </div>
                {errors.price && (
                  <p className="add-cards__error">{errors.price}</p>
                )}
                {errors.submit && !errors.price && (
                  <p className="add-cards__error">{errors.submit}</p>
                )}
              </Card>
            </div>

            <div className="add-cards__actions add-cards__actions--centered">
              <Button
                variant="secondary"
                onClick={handleSaveAndExit}
                className="add-cards__button"
              >
                SAVE AND EXIT
              </Button>
              <Button
                variant="primary"
                onClick={handleContinue}
                disabled={!canContinue}
                className="add-cards__button"
              >
                CONTINUE TO REVIEW
              </Button>
            </div>
          </div>
        </div>
      </Container>
      <LandingFooter />
    </div>
  );
};
