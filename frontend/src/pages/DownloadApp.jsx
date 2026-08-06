import React from "react";

const DownloadApp = () => {
  const handleDownload = () => {
    window.location.href =
      "https://github.com/tcpitsolution/gym-saas/releases/download/v1.0.0/flexopsapp.apk";
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Download FlexOpsApp</h1>
        <p style={styles.subtitle}>
          Get the FlexOpsApp Android app and manage your gym on the go.
        </p>
        <button style={styles.button} onClick={handleDownload}>
          Download APK (v1.0.0)
        </button>
        <p style={styles.note}>
          Note: You may need to allow "Install from unknown sources" in your
          Android settings.
        </p>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    background: "#f5f5f5",
    padding: "20px",
  },
  card: {
    background: "#fff",
    borderRadius: "12px",
    padding: "40px",
    textAlign: "center",
    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
    maxWidth: "400px",
  },
  title: {
    fontSize: "24px",
    marginBottom: "10px",
  },
  subtitle: {
    color: "#666",
    marginBottom: "25px",
  },
  button: {
    background: "#4f46e5",
    color: "#fff",
    border: "none",
    padding: "14px 28px",
    fontSize: "16px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
  },
  note: {
    marginTop: "20px",
    fontSize: "13px",
    color: "#999",
  },
};

export default DownloadApp;
