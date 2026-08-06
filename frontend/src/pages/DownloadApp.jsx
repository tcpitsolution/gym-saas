import React from "react";

const APK_URL =
  "https://github.com/tcpitsolution/gym-saas/releases/download/v1.0.0/flexopsapp.apk";

const benefits = [
  {
    title: "Members, on your phone",
    desc: "Check-in, search, and add members without opening a laptop.",
  },
  {
    title: "Billing and penalties",
    desc: "Collect dues and apply late fees from the gym floor.",
  },
  {
    title: "Reminders that send themselves",
    desc: "Renewal and payment nudges go out automatically.",
  },
  {
    title: "Reports on the go",
    desc: "See today's collections and attendance in one glance.",
  },
];

const DownloadApp = () => {
  const handleDownload = () => {
    window.location.href = APK_URL;
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.left}>
          <span style={styles.eyebrow}>ANDROID APP · V1.0.0</span>
          <h1 style={styles.title}>
            Run your gym.
            <br />
            <span style={styles.titleAccent}>From your pocket.</span>
          </h1>
          <p style={styles.subtitle}>
            The FlexOps app you already use on desktop — now for your phone.
            Members, billing, penalties, and reports, wherever you are on the
            floor.
          </p>

          <button
            style={styles.button}
            onClick={handleDownload}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = colors.orangeHover)
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = colors.orange)
            }
          >
            Download APK
            <span style={styles.buttonArrow}>&rarr;</span>
          </button>

          <p style={styles.note}>
            110 MB &middot; Android 8.0+ &middot; You may need to allow "Install
            from unknown sources" in your phone settings.
          </p>

          <div style={styles.benefitGrid}>
            {benefits.map((b) => (
              <div key={b.title} style={styles.benefitCard}>
                <span style={styles.benefitCheck}>&#10003;</span>
                <div>
                  <p style={styles.benefitTitle}>{b.title}</p>
                  <p style={styles.benefitDesc}>{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={styles.right}>
          <div style={styles.phoneFrame}>
            <div style={styles.phoneNotch} />
            <div style={styles.phoneScreen}>
              <span style={styles.phoneLogo}>
                FLEX<span style={{ color: colors.orange }}>OPS</span>
              </span>
              <div style={styles.phoneStatRow}>
                <div style={styles.phoneStat}>
                  <p style={styles.phoneStatNum}>128</p>
                  <p style={styles.phoneStatLabel}>Active members</p>
                </div>
                <div style={styles.phoneStat}>
                  <p style={{ ...styles.phoneStatNum, color: colors.teal }}>
                    &#8377;42k
                  </p>
                  <p style={styles.phoneStatLabel}>This month</p>
                </div>
              </div>
              <div style={styles.phoneListItem} />
              <div style={styles.phoneListItem} />
              <div style={{ ...styles.phoneListItem, width: "60%" }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const colors = {
  bg: "#0b0b0c",
  card: "#151517",
  border: "#232326",
  orange: "#ff5722",
  orangeHover: "#e64a19",
  teal: "#2dd4bf",
  white: "#f5f5f5",
  gray: "#9a9a9e",
};

const styles = {
  page: {
    minHeight: "100vh",
    background: colors.bg,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "60px 24px",
  },
  container: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: "56px",
    maxWidth: "1040px",
    width: "100%",
  },
  left: {
    flex: "1 1 480px",
    minWidth: "320px",
  },
  eyebrow: {
    color: colors.teal,
    fontSize: "13px",
    fontWeight: 700,
    letterSpacing: "1.5px",
  },
  title: {
    color: colors.white,
    fontSize: "48px",
    fontWeight: 800,
    lineHeight: 1.1,
    margin: "16px 0 20px",
  },
  titleAccent: {
    color: colors.teal,
  },
  subtitle: {
    color: colors.gray,
    fontSize: "17px",
    lineHeight: 1.6,
    maxWidth: "460px",
    marginBottom: "32px",
  },
  button: {
    display: "inline-flex",
    alignItems: "center",
    gap: "10px",
    background: colors.orange,
    color: "#fff",
    border: "none",
    padding: "16px 32px",
    fontSize: "16px",
    fontWeight: 700,
    borderRadius: "8px",
    cursor: "pointer",
    transition: "background 0.15s ease",
  },
  buttonArrow: {
    fontSize: "18px",
  },
  note: {
    color: colors.gray,
    fontSize: "13px",
    marginTop: "14px",
    marginBottom: "44px",
  },
  benefitGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "20px",
  },
  benefitCard: {
    display: "flex",
    gap: "12px",
    alignItems: "flex-start",
  },
  benefitCheck: {
    color: colors.teal,
    fontWeight: 700,
    fontSize: "15px",
    marginTop: "2px",
  },
  benefitTitle: {
    color: colors.white,
    fontSize: "15px",
    fontWeight: 700,
    margin: "0 0 4px",
  },
  benefitDesc: {
    color: colors.gray,
    fontSize: "13px",
    lineHeight: 1.5,
    margin: 0,
  },
  right: {
    flex: "0 0 auto",
    display: "flex",
    justifyContent: "center",
    width: "100%",
    maxWidth: "300px",
  },
  phoneFrame: {
    width: "260px",
    height: "540px",
    background: "#000",
    borderRadius: "36px",
    border: `2px solid ${colors.border}`,
    padding: "14px",
    position: "relative",
  },
  phoneNotch: {
    position: "absolute",
    top: "14px",
    left: "50%",
    transform: "translateX(-50%)",
    width: "90px",
    height: "18px",
    background: "#000",
    borderRadius: "10px",
    zIndex: 2,
  },
  phoneScreen: {
    background: colors.card,
    borderRadius: "24px",
    height: "100%",
    width: "100%",
    padding: "44px 18px 18px",
  },
  phoneLogo: {
    color: colors.white,
    fontSize: "18px",
    fontWeight: 800,
    letterSpacing: "0.5px",
  },
  phoneStatRow: {
    display: "flex",
    gap: "12px",
    margin: "24px 0",
  },
  phoneStat: {
    flex: 1,
    background: colors.bg,
    borderRadius: "10px",
    padding: "12px",
  },
  phoneStatNum: {
    color: colors.white,
    fontSize: "20px",
    fontWeight: 800,
    margin: "0 0 4px",
  },
  phoneStatLabel: {
    color: colors.gray,
    fontSize: "11px",
    margin: 0,
  },
  phoneListItem: {
    height: "14px",
    background: colors.bg,
    borderRadius: "6px",
    marginBottom: "12px",
    width: "100%",
  },
};

export default DownloadApp;
