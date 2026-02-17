import { useEffect, useRef, useState } from "react";
import "./BuiltBySlashEasy.css";

export function BuiltBySlashEasy() {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef(null);
  const modalRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    const handlePointerDown = (event) => {
      const targetNode = event.target;

      if (modalRef.current?.contains(targetNode)) {
        return;
      }

      if (buttonRef.current?.contains(targetNode)) {
        return;
      }

      setIsOpen(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
    };
  }, [isOpen]);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        className="bbse-float"
        onClick={() => setIsOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-controls="bbse-tech-stack-modal"
      >
        <span className="bbse-float__dot" aria-hidden="true" />
        <span>Built by SlashEasy</span>
        <span className="bbse-float__arrow" aria-hidden="true">
          ▾
        </span>
      </button>

      {isOpen ? (
        <div
          ref={modalRef}
          className="bbse-modal"
          role="dialog"
          id="bbse-tech-stack-modal"
          aria-label="Tech Stack"
        >
          <header className="bbse-modal__header">
            <div className="bbse-modal__title-wrap">
              <span className="bbse-modal__icon" aria-hidden="true">
                &lt;/&gt;
              </span>
              <h3 className="bbse-modal__title">Tech Stack</h3>
            </div>
            <button
              type="button"
              className="bbse-modal__close"
              onClick={() => setIsOpen(false)}
              aria-label="Close tech stack"
            >
              ×
            </button>
          </header>

          <section className="bbse-modal__content">
            <div className="bbse-modal__section">
              <p className="bbse-modal__label">FRONTEND</p>
              <p className="bbse-modal__main">React.js</p>
              <p className="bbse-modal__sub">(with React Query)</p>
            </div>

            <hr className="bbse-modal__divider" />

            <div className="bbse-modal__section">
              <p className="bbse-modal__label">BACKEND &amp; DATABASE</p>
              <p className="bbse-modal__main">FastAPI &amp; MongoDB</p>
            </div>
          </section>

          <footer className="bbse-modal__footer">
            Built with <span className="bbse-modal__heart">❤</span> by SlashEasy
          </footer>
        </div>
      ) : null}
    </>
  );
}
