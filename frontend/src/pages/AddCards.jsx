import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Input, Card } from "../components/UI.jsx";
import { sessionStorageManager } from "../utils/cache.js";
import { Header, Container } from "../layouts/MainLayout.jsx";
import { LandingFooter } from "../components/LandingChrome.jsx";

export const AddCardsPage = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [numberOnly, setNumberOnly] = useState(false);
  const [totalCount, setTotalCount] = useState("");
  const [cards, setCards] = useState([]);
  const [cardForm, setCardForm] = useState({
    player: "",
    year: "",
    set: "",
    cardNumber: "",
    notes: "",
  });
  const [editIndex, setEditIndex] = useState(null);
  const [errors, setErrors] = useState({});
  const serviceTier = "THE_STANDARD";

  useEffect(() => {
    const cached = sessionStorageManager.getSubmissionForm();
    if (cached) {
      setCards(cached.cards || []);
      setNumberOnly(Boolean(cached.numberOnly));
      setTotalCount(cached.cardCount ? String(cached.cardCount) : "");
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
    const formErrors = validateCardForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setErrors({});

    if (editIndex !== null) {
      setCards((prev) =>
        prev.map((card, index) =>
          index === editIndex ? { ...cardForm } : card,
        ),
      );
    } else {
      setCards((prev) => [...prev, { ...cardForm }]);
    }

    setCardForm({
      player: "",
      year: "",
      set: "",
      cardNumber: "",
      notes: "",
    });
    setEditIndex(null);
  };

  const handleEditCard = (index) => {
    setCardForm(cards[index]);
    setEditIndex(index);
  };

  const handleDeleteCard = (index) => {
    setCards((prev) => prev.filter((_, i) => i !== index));
    if (editIndex === index) {
      setEditIndex(null);
      setCardForm({
        player: "",
        year: "",
        set: "",
        cardNumber: "",
        notes: "",
      });
    }
  };

  const handleToggleNumberOnly = () => {
    setNumberOnly((prev) => {
      const next = !prev;
      if (next) {
        setCards([]);
        setCardForm({
          player: "",
          year: "",
          set: "",
          cardNumber: "",
          notes: "",
        });
        setEditIndex(null);
      }
      setErrors({});
      return next;
    });
  };

  const canContinue = useMemo(() => {
    if (numberOnly) {
      return Number(totalCount) > 0;
    }

    return cards.length > 0;
  }, [numberOnly, totalCount, cards.length]);

  const handleContinue = () => {
    if (!canContinue) {
      setErrors((prev) => ({
        ...prev,
        submit: numberOnly
          ? "Enter total number of cards"
          : "Add at least one card",
      }));
      return;
    }

    sessionStorageManager.setSubmissionForm({
      cards: numberOnly ? [] : cards,
      cardCount: numberOnly ? Number(totalCount) : cards.length,
      serviceTier,
      numberOnly,
    });

    navigate("/submission-review", {
      state: {
        cards: numberOnly ? [] : cards,
        serviceTier,
        cardCount: numberOnly ? Number(totalCount) : cards.length,
      },
    });
  };

  const handleSaveAndExit = () => {
    sessionStorageManager.setSubmissionForm({
      cards: numberOnly ? [] : cards,
      cardCount: numberOnly ? Number(totalCount) : cards.length,
      serviceTier,
      numberOnly,
    });
    navigate("/dashboard");
  };

  return (
    <div className="ng-app-shell ng-app-shell--dark">
      <Header user={user} onLogout={onLogout} />
      <Container>
        <div className="ng-section add-cards-page">
          <h1 className="ng-page-title">ADD CARDS</h1>
          <div className="add-cards__container">
            <Card className="add-cards__panel">
              <h2>ADD A CARD</h2>
              <label className="add-cards__toggle">
                <input
                  type="checkbox"
                  checked={numberOnly}
                  onChange={handleToggleNumberOnly}
                />
                <span>Enter number of cards only</span>
              </label>

              {numberOnly ? (
                <Input
                  type="number"
                  label="TOTAL NUMBER OF CARDS"
                  placeholder="0"
                  min="1"
                  value={totalCount}
                  onChange={(e) => setTotalCount(e.target.value)}
                  error={errors.submit}
                />
              ) : (
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
                  <Button
                    variant="primary"
                    className="ng-button--block"
                    onClick={handleAddOrUpdate}
                  >
                    {editIndex !== null ? "UPDATE CARD" : "ADD CARD"}
                  </Button>
                </div>
              )}
            </Card>

            {!numberOnly && (
              <Card className="add-cards__list">
                <h2>ADDED CARDS</h2>
                {cards.length === 0 ? (
                  <p className="add-cards__empty">No cards added yet.</p>
                ) : (
                  <div className="ng-table-wrapper">
                    <table className="ng-table">
                      <thead>
                        <tr>
                          <th>PLAYER</th>
                          <th>YEAR</th>
                          <th>SET</th>
                          <th>CARD #</th>
                          <th>ACTIONS</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cards.map((card, index) => (
                          <tr className="ng-table__row" key={index}>
                            <td className="ng-table__cell">{card.player}</td>
                            <td className="ng-table__cell">{card.year}</td>
                            <td className="ng-table__cell">{card.set}</td>
                            <td className="ng-table__cell">
                              {card.cardNumber}
                            </td>
                            <td className="ng-table__cell">
                              <div className="add-cards__row-actions">
                                <button
                                  type="button"
                                  className="add-cards__action"
                                  onClick={() => handleEditCard(index)}
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  className="add-cards__action add-cards__action--danger"
                                  onClick={() => handleDeleteCard(index)}
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Card>
            )}

            <div className="add-cards__actions">
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
