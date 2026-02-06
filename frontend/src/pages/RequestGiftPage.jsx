import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getUserByName } from "../services/userService";
import { useSelector } from "react-redux";
import { createGiftRequest } from "../services/giftRequestService";

const RequestGiftPage = () => {
  const { sellerName } = useParams();
  const navigate = useNavigate();

  const [seller, setSeller] = useState(null);
  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const { userInfo } = useSelector((state) => state.auth);

  useEffect(() => {
    let mounted = true;
    async function fetchSeller() {
      try {
        const data = await getUserByName(sellerName);
        if (mounted) setSeller(data);
      } catch {
        if (mounted) setError("Seller not found");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    fetchSeller();
    return () => (mounted = false);
  }, [sellerName]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    setError("");
    try {
      await createGiftRequest({ sellerName, description, budget });
      navigate(`/users/${seller?.name}`);
    } catch (err) {
      setError(err?.message || "Failed to send request");
    } finally {
      setSending(false);
    }
  };


  const styles = {
    page: {
      minHeight: "100vh",
      backgroundColor: "#f9fff9",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "2rem"
    },
    wrapper: {
      width: "100%",
      maxWidth: "56rem"
    },
    loadingContainer: {
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#f9fff9",
      gap: "1rem"
    },
    spinner: {
      width: "3rem",
      height: "3rem",
      border: "3px solid #ccc",
      borderTopColor: "#10b981",
      borderRadius: "50%"
    },
    headerSection: {
      textAlign: "left",
      marginBottom: "40px",
      padding: "10px 0"
    },
    formCard: {
      backgroundColor: "#fff",
      boxShadow: "0 0 10px green",
      padding: "2.5rem",
      marginBottom: "2rem",
      border: "1px solid grey",
      borderRadius: "8px"
    },
    title: {
      fontSize: "2rem",
      fontWeight: 600,
      color: "#1a1a1a",
      marginBottom: "0.5rem"
    },
    subtitle: {
      fontSize: "1.125rem",
      color: "#666"
    },
    sellerName: {
      fontWeight: 600,
      color: "#ec4899"
    },
    form: {
      display: "flex",
      flexDirection: "column",
      gap: "2rem"
    },
    label: {
      fontSize: "0.9rem",
      fontWeight: "bold",
      color: "#333"
    },
    textarea: {
      width: "100%",
      padding: "1rem",
      minHeight: "18rem",
      border: "1px solid #ccc",
      borderRadius: "4px",
      fontSize: "1rem"
    },
    budgetWrapper: {
      position: "relative"
    },
    currency: {
      position: "absolute",
      left: "1rem",
      top: "50%",
      transform: "translateY(-50%)",
      color: "#666",
      fontWeight: 600
    },
    input: {
      width: "100%",
      padding: "1rem 1rem 1rem 2.5rem",
      border: "1px solid #ccc",
      borderRadius: "4px",
      fontSize: "1rem"
    },
    error: {
      color: "red",
      fontWeight: "bold"
    },
    submit: {
      width: "100%",
      padding: "1.125rem",
      fontWeight: "bold",
      fontSize: "1.125rem",
      color: sending ? "#999" : "#333",
      backgroundColor: sending ? "#eee" : "#e0ffe0",
      border: "1px solid #ccc",
      borderRadius: "4px",
      cursor: sending ? "not-allowed" : "pointer"
    }
  };


  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.wrapper}>
        <div style={styles.headerSection}>
          <h1 style={styles.title}>Request a Custom Gift</h1>
          <p style={styles.subtitle}>
            from <span style={styles.sellerName}>{seller?.name}</span>
          </p>
        </div>

        <div style={styles.formCard}>
          <form onSubmit={handleSubmit} style={styles.form}>
            <div>
              <label style={styles.label}>Gift Description</label>
              <textarea
                style={styles.textarea}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            <div>
              <label style={styles.label}>Your Budget</label>
              <div style={styles.budgetWrapper}>
                <span style={styles.currency}>₹</span>
                <input
                  type="number"
                  style={styles.input}
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  required
                />
              </div>
            </div>

            {error && <div style={styles.error}>{error}</div>}

            <button type="submit" disabled={sending} style={styles.submit}>
              {sending ? "Sending Request..." : "Send Gift Request"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RequestGiftPage;

