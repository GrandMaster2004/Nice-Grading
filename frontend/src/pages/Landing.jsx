import { useNavigate } from "react-router-dom";

const TicketCard = ({ color, children, className = "" }) => {
  return (
    <div
      className={`ticket-card ${className}`}
      style={{
        maskImage: `
          radial-gradient(circle at 10px 0, transparent 5px, white 5.5px),
          linear-gradient(to bottom, white, white)
        `,
        maskSize: "20px 20px, 100% calc(100% - 10px)",
        maskPosition: "top center, bottom center",
        maskRepeat: "repeat-x, no-repeat",
        WebkitMaskImage: `
          radial-gradient(circle at 10px 0, transparent 5px, white 5.5px),
          linear-gradient(to bottom, white, white)
        `,
        WebkitMaskSize: "20px 20px, 100% calc(100% - 10px)",
        WebkitMaskPosition: "top center, bottom center",
        WebkitMaskRepeat: "repeat-x, no-repeat",
      }}
    >
      <div
        className="ticket-card__inner"
        style={{
          background: color,
          maskImage: `
            radial-gradient(circle at 10px bottom, transparent 5px, white 5.5px),
            linear-gradient(to top, white, white)
          `,
          maskSize: "20px 20px, 100% calc(100% - 10px)",
          maskPosition: "bottom center, top center",
          maskRepeat: "repeat-x, no-repeat",
          WebkitMaskImage: `
            radial-gradient(circle at 10px bottom, transparent 5px, white 5.5px),
            linear-gradient(to top, white, white)
          `,
          WebkitMaskSize: "20px 20px, 100% calc(100% - 10px)",
          WebkitMaskPosition: "bottom center, top center",
          WebkitMaskRepeat: "repeat-x, no-repeat",
        }}
      >
        {children}
      </div>
    </div>
  );
};

const hallOfFlex = [
  { user: "MS1_1500" },
  { user: "MYD9ALLAS" },
  { user: "WYERAILLAB" },
  { user: "MYRSAILLAR" },
  { user: "T6SMLLAS" },
  { user: "TGRAULAS" },
  { user: "TRBLAAS" },
  { user: "WTERALLLAD" },
];

export const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="landing">
      <div className="landing__hero">
        <div className="landing__ticker">
          MURDER YOUR MID COLLECTION • SLAY THE SLAB GAME • NO CAP • ACTIVATE,
          WEDNESDAY, FEBRUARY 4, 2026 6:9:58 PM IST
        </div>

        <nav className="landing__nav">
          <div className="landing__logo" onClick={() => navigate("/")}>
            NICE G.
          </div>
          <div className="landing__links">
            <a href="#" className="landing__link">
              PRICING
            </a>
            <a href="#" className="landing__link">
              HALL OF FLEX
            </a>
            <button className="landing__icon" type="button" aria-label="Search">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                stroke="currentColor"
                fill="none"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>
          </div>
          <div className="landing__actions">
            <button
              onClick={() => navigate("/auth")}
              className="landing__action"
              type="button"
            >
              LOGIN
            </button>
            <button
              onClick={() => navigate("/auth?mode=register")}
              className="landing__action landing__action--primary"
              type="button"
            >
              Start
            </button>
          </div>
        </nav>

        <div className="landing__hero-content">
          <div className="landing__hero-copy">
            <h1 className="landing__hero-title">Flex Your Grail.</h1>
            <h1 className="landing__hero-title">Get That 10.</h1>
            <h1 className="landing__hero-title">Iconic.</h1>

            <p className="landing__hero-text">
              Next-gen grading for the real new era.
              <br /> Aura-aura-boostier pookies.
            </p>

            <div className="landing__cta-group">
              <button
                onClick={() => navigate("/dashboard")}
                className="landing__cta landing__cta--violet"
                type="button"
              >
                Get My Cards
              </button>
              <button className="landing__cta landing__cta--fire" type="button">
                Explore The Drip
              </button>
            </div>
          </div>

          <div className="landing__hero-card">
            <div className="landing__glow landing__glow--magenta"></div>
            <div className="landing__glow landing__glow--sunset"></div>
            <div className="landing__glow landing__glow--violet"></div>

            <div className="landing__card-frame">
              <div className="landing__card-border"></div>
              <div className="landing__card-shine"></div>
              <div className="landing__card-graphic">
                <svg viewBox="0 0 100 100">
                  <path d="M50 20c-15 0-25 10-25 25 0 10 5 15 10 20-5 5-5 15 0 20 8 8 20 5 20 5s12 3 20-5c5-5 5-15 0-20 5-5 10-10 10-20C85 30 75 20 60 20c-5 0-5 5-10 5-5 0-5-5-10-5z" />
                  <path d="M35 45c5 0 10-5 10-10" />
                  <path d="M65 45c-5 0-10-5-10-10" />
                  <path d="M40 60c5 5 15 5 20 0" />
                </svg>
                <div className="landing__card-chip">10</div>
              </div>
              <div className="landing__card-particle landing__card-particle--one"></div>
              <div className="landing__card-particle landing__card-particle--two"></div>
              <div className="landing__card-particle landing__card-particle--three"></div>
            </div>
          </div>
        </div>

        <div className="landing__grid-floor">
          <div className="landing__grid-pattern"></div>
        </div>
      </div>

      <div className="landing__content">
        <div className="landing__content-inner">
          <div className="landing__columns">
            <div className="landing__pricing">
              <div className="landing__pricing-head">
                <h2>Choose Your Energy</h2>
              </div>
              <div className="landing__tickets">
                <TicketCard color="#8b5cf6" className="landing__ticket">
                  <div className="landing__ticket-body">
                    <p className="landing__ticket-copy">
                      Standard service for standard people. No rush, just vibes.
                    </p>
                    <h3 className="landing__ticket-title">'MID' TIER -</h3>
                    <p className="landing__ticket-price">$15 / CARD</p>
                    <div className="landing__ticket-tag">BRUH45GRK</div>
                  </div>
                  <div className="landing__ticket-meta">
                    <div>
                      NON-REFUNDABLE
                      <br /> VALID FOR ONE
                      <br /> SUBMISSION
                      <br /> TERMS APPLY
                    </div>
                    <span>28</span>
                  </div>
                </TicketCard>

                <TicketCard color="#ec4899" className="landing__ticket">
                  <div className="landing__ticket-body">
                    <p className="landing__ticket-copy">
                      For the ones who need it now. Priority handling & gaming.
                    </p>
                    <h3 className="landing__ticket-title">MAIN</h3>
                    <h3 className="landing__ticket-title">CHARACTER</h3>
                    <p className="landing__ticket-price">$40 / CARD</p>
                    <div className="landing__ticket-tag">SHE50CLASSY</div>
                  </div>
                  <div className="landing__ticket-meta">
                    <div>
                      NON-REFUNDABLE
                      <br /> VALID FOR ONE
                      <br /> SUBMISSION
                      <br /> TERMS APPLY
                    </div>
                    <span>28</span>
                  </div>
                </TicketCard>

                <TicketCard
                  color="linear-gradient(180deg, #facc15 0%, #f97316 100%)"
                  className="landing__ticket"
                >
                  <div className="landing__ticket-body">
                    <p className="landing__ticket-copy">
                      Instant verification. Walk in flex out.
                    </p>
                    <h3 className="landing__ticket-title">GOAT STATUS</h3>
                    <p className="landing__ticket-price">$100 / CARD</p>
                    <div className="landing__ticket-tag">24HOURFLIP</div>
                  </div>
                  <div className="landing__ticket-meta">
                    <div>
                      NON-REFUNDABLE
                      <br /> VALID FOR ONE
                      <br /> SUBMISSION
                      <br /> TERMS APPLY
                    </div>
                    <span>28</span>
                  </div>
                </TicketCard>
              </div>

              <div className="landing__process">
                <h2>The Process (Real-One Edition)</h2>
                <div className="landing__process-steps">
                  {["PACK 'EM.", "SHIP 'EM.", "GRADE 'EM", "FLEX 'EM"].map(
                    (label, index) => (
                      <div className="landing__process-step" key={label}>
                        <div
                          className={`landing__process-badge landing__process-badge--${index + 1}`}
                        >
                          {index + 1 === 4 ? (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                            >
                              <path
                                d="M13 10V3L4 14h7v7l9-11h-7z"
                                stroke="currentColor"
                                strokeWidth={2}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                fill="none"
                              />
                            </svg>
                          ) : (
                            <span>{index + 1}</span>
                          )}
                        </div>
                        <span>{label}</span>
                      </div>
                    ),
                  )}
                </div>
              </div>

              <div className="landing__statement">
                <h2>
                  Join The Era. <br /> Murder Mid.
                </h2>
                <p>
                  We're not your grandpa's company. We're building the future of
                  every collection, where value is born from internet culture,
                  fueled by passion, and dedicated to the absolute W.
                </p>
              </div>
            </div>

            <div className="landing__gallery">
              <h2>The Hall of Flex</h2>
              <div className="landing__gallery-grid">
                {hallOfFlex.map((item) => (
                  <div className="landing__gallery-card" key={item.user}>
                    <img
                      src="https://mir-s3-cdn-cf.behance.net/projects/404/808cdf187184933.Y3JvcCwxNTAwLDExNzMsMCwxMDcz.jpg"
                      alt={`Flex by ${item.user}`}
                      referrerPolicy="no-referrer"
                    />
                    <div className="landing__gallery-overlay"></div>
                    <div className="landing__gallery-badge">NICE</div>
                    <div className="landing__gallery-user">@{item.user}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="landing__join">
        <div className="landing__join-inner">
          <div className="landing__join-copy">
            <div className="landing__join-marker">GRADING NICE CO</div>
            <div className="landing__join-skull">
              <svg viewBox="0 0 100 100">
                <path d="M50 15c-15 0-20 10-20 18 0 8-5 8-5 15 0 7 8 10 8 10h54s8-3 8-10c0-7-5-7-5-15 0-8-5-18-20-18zm-8 35h16v8h-16zm16 0h16v8h-16z" />
              </svg>
              <span></span>
            </div>
            <h2>Join The Circle.</h2>
            <h3>One Price. No Upcharges.</h3>
            <div className="landing__join-price">
              $15 <span>/ CARD</span>
            </div>
            <ul>
              <li>10 Day Turnaround (Or we buy you drink)</li>
              <li>UV Protected Sonic-Welled Slabs</li>
              <li>Insurance that actually pays out</li>
            </ul>
            <button className="landing__join-cta" type="button">
              Give Us Your Cards
            </button>
          </div>

          <div className="landing__join-gallery">
            <h3>
              Grading is boring.
              <br /> <span>NICE</span> is riot.
            </h3>
            <div className="landing__masonry">
              {[1, 2, 3, 4, 5, 6].map((slot) => (
                <div
                  className={`landing__masonry-item landing__masonry-item--${slot}`}
                  key={slot}
                >
                  <img
                    src="https://mir-s3-cdn-cf.behance.net/projects/404/808cdf187184933.Y3JvcCwxNTAwLDExNzMsMCwxMDcz.jpg"
                    alt="Gallery"
                  />
                </div>
              ))}
              <div className="landing__masonry-icon">👑</div>
            </div>
            <div className="landing__newsletter">
              <p>Sell your soul to our newsletter</p>
              <div>
                <input type="email" placeholder="asoul" />
                <button type="button">Submit</button>
              </div>
            </div>
            <div className="landing__mini-links">
              <a href="#">Dashboard</a>
              <a href="#">Ship</a>
              <a href="#">FAQ</a>
            </div>
          </div>
        </div>
      </div>

      <footer className="landing__footer">
        <div className="landing__footer-inner">
          <div className="landing__footer-logo">NICE G.</div>
          <div className="landing__footer-scroll">
            <span>Murder Your Mid Collection</span>
            <span>Slay The Slab Game</span>
            <span>No Cap</span>
            <span>Aura Boost High Activity</span>
          </div>
          <div className="landing__footer-icons">
            <button type="button">♪</button>
            <button type="button">📷</button>
            <button type="button">🐦</button>
          </div>
        </div>
        <p>© 2026 NICE G. ALL RIGHTS RESERVED</p>
      </footer>
    </div>
  );
};
