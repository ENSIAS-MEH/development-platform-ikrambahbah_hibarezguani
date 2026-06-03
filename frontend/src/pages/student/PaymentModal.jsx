// src/pages/student/PaymentModal.jsx
import { useState } from "react";
import { apiClient } from "../../services/authService";  // ✅ Utilise apiClient au lieu de axios

/**
 * Modal de paiement simulé.
 *
 * Props :
 *   training   - objet formation (id, title, price)
 *   onSuccess  - callback(transactionId) appelé si paiement accepté
 *   onClose    - callback pour fermer le modal
 */
function PaymentModal({ training, onSuccess, onClose }) {
  const [step, setStep] = useState("form"); // "form" | "processing" | "success" | "error"
  const [form, setForm] = useState({
    cardNumber: "",
    cardHolder: "",
    expiryDate: "",
    cvv: "",
    currency: "MAD",
  });
  const [result, setResult] = useState(null);
  const [errors, setErrors] = useState({});

  // ✅ Plus besoin de getAuthHeader() car apiClient le fait automatiquement

  // ── Formatage automatique du numéro de carte (groupes de 4) ──
  const formatCardNumber = (value) => {
    const digits = value.replace(/\D/g, "").slice(0, 16);
    return digits.replace(/(.{4})/g, "$1 ").trim();
  };

  // ── Formatage de la date d'expiration (MM/YY) ──
  const formatExpiry = (value) => {
    const digits = value.replace(/\D/g, "").slice(0, 4);
    if (digits.length >= 3) return digits.slice(0, 2) + "/" + digits.slice(2);
    return digits;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let formatted = value;
    if (name === "cardNumber") formatted = formatCardNumber(value);
    if (name === "expiryDate") formatted = formatExpiry(value);
    if (name === "cvv") formatted = value.replace(/\D/g, "").slice(0, 3);
    setForm((prev) => ({ ...prev, [name]: formatted }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // ── Validation côté client ──
  const validate = () => {
    const errs = {};
    const card = form.cardNumber.replace(/\s/g, "");
    if (card.length !== 16) errs.cardNumber = "Numéro de carte invalide (16 chiffres)";
    if (!form.cardHolder.trim()) errs.cardHolder = "Nom du titulaire requis";
    if (!/^\d{2}\/\d{2}$/.test(form.expiryDate)) errs.expiryDate = "Format MM/AA requis";
    if (form.cvv.length !== 3) errs.cvv = "CVV invalide (3 chiffres)";
    return errs;
  };

  // ── Soumission du formulaire ──
  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setStep("processing");

    try {
      const payload = {
        cardNumber: form.cardNumber.replace(/\s/g, ""),
        cardHolder: form.cardHolder,
        expiryDate: form.expiryDate,
        cvv: form.cvv,
        currency: form.currency,
      };

      // ✅ Changement : utilise apiClient (pointe vers Gateway)
      // ✅ Plus besoin de mettre les headers manuellement
      const res = await apiClient.post(
        `/api/trainings/${training.id}/enroll-paid`,
        payload
      );

      setResult(res.data);
      setStep(res.data.success ? "success" : "error");
    } catch (err) {
      const msg = err.response?.data || err.message;
      setResult({ success: false, message: typeof msg === "string" ? msg : "Erreur serveur" });
      setStep("error");
    }
  };

  // ── Détection visuelle du type de carte ──
  const getCardBrand = () => {
    const n = form.cardNumber.replace(/\s/g, "");
    if (n.startsWith("4")) return { label: "VISA", color: "#1a1f71" };
    if (n.startsWith("5")) return { label: "MC", color: "#eb001b" };
    if (n.startsWith("3")) return { label: "AMEX", color: "#007bc1" };
    return { label: "••••", color: "#94a3b8" };
  };

  const brand = getCardBrand();

  return (
    <div style={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={styles.modal}>

        {/* ── En-tête ── */}
        <div style={styles.header}>
          <div>
            <div style={styles.lockIcon}>🔒</div>
            <h2 style={styles.title}>Paiement sécurisé</h2>
          </div>
          <button style={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        {/* ── Résumé commande ── */}
        <div style={styles.orderSummary}>
          <span style={styles.orderLabel}>📚 {training.title}</span>
          <span style={styles.orderPrice}>
            {training.price?.toFixed(2)} {form.currency}
          </span>
        </div>

        {/* ════════════════════════════ ÉTAPE : FORMULAIRE ════════════════════════════ */}
        {step === "form" && (
          <form onSubmit={handleSubmit} style={styles.form}>

            {/* Devise */}
            <div style={styles.field}>
              <label style={styles.label}>Devise</label>
              <select
                name="currency"
                value={form.currency}
                onChange={handleChange}
                style={styles.select}
              >
                <option value="MAD">🇲🇦 MAD — Dirham marocain</option>
                <option value="EUR">🇪🇺 EUR — Euro</option>
                <option value="USD">🇺🇸 USD — Dollar américain</option>
              </select>
            </div>

            {/* Numéro de carte */}
            <div style={styles.field}>
              <label style={styles.label}>Numéro de carte</label>
              <div style={styles.cardInputWrapper}>
                <input
                  name="cardNumber"
                  value={form.cardNumber}
                  onChange={handleChange}
                  placeholder="1234 5678 9012 3456"
                  style={{ ...styles.input, paddingRight: "60px", ...(errors.cardNumber ? styles.inputError : {}) }}
                  maxLength={19}
                />
                <span style={{ ...styles.cardBrand, color: brand.color }}>{brand.label}</span>
              </div>
              {errors.cardNumber && <span style={styles.error}>{errors.cardNumber}</span>}
            </div>

            {/* Titulaire */}
            <div style={styles.field}>
              <label style={styles.label}>Nom du titulaire</label>
              <input
                name="cardHolder"
                value={form.cardHolder}
                onChange={handleChange}
                placeholder="YOUSSEF ALAOUI"
                style={{ ...styles.input, textTransform: "uppercase", ...(errors.cardHolder ? styles.inputError : {}) }}
              />
              {errors.cardHolder && <span style={styles.error}>{errors.cardHolder}</span>}
            </div>

            {/* Expiry + CVV */}
            <div style={styles.row}>
              <div style={{ ...styles.field, flex: 1 }}>
                <label style={styles.label}>Date d'expiration</label>
                <input
                  name="expiryDate"
                  value={form.expiryDate}
                  onChange={handleChange}
                  placeholder="MM/AA"
                  style={{ ...styles.input, ...(errors.expiryDate ? styles.inputError : {}) }}
                  maxLength={5}
                />
                {errors.expiryDate && <span style={styles.error}>{errors.expiryDate}</span>}
              </div>
              <div style={{ ...styles.field, flex: 1 }}>
                <label style={styles.label}>CVV</label>
                <input
                  name="cvv"
                  value={form.cvv}
                  onChange={handleChange}
                  placeholder="123"
                  type="password"
                  style={{ ...styles.input, ...(errors.cvv ? styles.inputError : {}) }}
                  maxLength={3}
                />
                {errors.cvv && <span style={styles.error}>{errors.cvv}</span>}
              </div>
            </div>

            {/* Note de simulation */}
            <div style={styles.simNote}>
              ⚠️ <strong>Mode simulation</strong> — aucune vraie transaction n'est effectuée.
              <br />
              Carte <code>0000...</code> = fonds insuffisants · <code>9999...</code> = carte bloquée · CVV <code>000</code> = CVV invalide
            </div>

            {/* Bouton payer */}
            <button type="submit" style={styles.payBtn}>
              💳 Payer {training.price?.toFixed(2)} {form.currency}
            </button>

            <button type="button" onClick={onClose} style={styles.cancelBtn}>
              Annuler
            </button>
          </form>
        )}

        {/* ════════════════════════════ ÉTAPE : TRAITEMENT ════════════════════════════ */}
        {step === "processing" && (
          <div style={styles.processingContainer}>
            <div style={styles.spinner} />
            <p style={styles.processingText}>Traitement du paiement en cours...</p>
            <p style={styles.processingSubtext}>Veuillez ne pas fermer cette fenêtre</p>
          </div>
        )}

        {/* ════════════════════════════ ÉTAPE : SUCCÈS ════════════════════════════ */}
        {step === "success" && result && (
          <div style={styles.resultContainer}>
            <div style={styles.successIcon}>✅</div>
            <h3 style={styles.successTitle}>Paiement accepté !</h3>
            <p style={styles.successMsg}>
              Vous êtes maintenant inscrit à <strong>{training.title}</strong>
            </p>

            <div style={styles.receiptBox}>
              <div style={styles.receiptRow}>
                <span>Transaction ID</span>
                <code style={styles.txId}>{result.transactionId}</code>
              </div>
              <div style={styles.receiptRow}>
                <span>Montant débité</span>
                <strong>{result.amountCharged?.toFixed(2)} {result.currency}</strong>
              </div>
              <div style={styles.receiptRow}>
                <span>Date</span>
                <span>{new Date(result.processedAt).toLocaleString("fr-FR")}</span>
              </div>
            </div>

            <button
              style={styles.payBtn}
              onClick={() => onSuccess(result.transactionId)}
            >
              🎓 Accéder à la formation
            </button>
          </div>
        )}

        {/* ════════════════════════════ ÉTAPE : ERREUR ════════════════════════════ */}
        {step === "error" && result && (
          <div style={styles.resultContainer}>
            <div style={styles.errorIcon}>❌</div>
            <h3 style={styles.errorTitle}>Paiement refusé</h3>
            <p style={styles.errorMsg}>{result.message}</p>

            <button style={styles.retryBtn} onClick={() => setStep("form")}>
              🔄 Réessayer avec une autre carte
            </button>
            <button style={styles.cancelBtn} onClick={onClose}>
              Annuler
            </button>
          </div>
        )}
      </div>

      {/* ── Spinner CSS ── */}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

// ── Styles inline (inchangés) ──
const styles = {
  overlay: {
    position: "fixed", inset: 0,
    background: "rgba(0,0,0,0.6)",
    display: "flex", alignItems: "center", justifyContent: "center",
    zIndex: 9999, padding: "16px",
  },
  modal: {
    background: "white",
    borderRadius: "24px",
    width: "100%", maxWidth: "460px",
    boxShadow: "0 25px 60px rgba(0,0,0,0.3)",
    overflow: "hidden",
    maxHeight: "90vh", overflowY: "auto",
  },
  header: {
    display: "flex", justifyContent: "space-between", alignItems: "flex-start",
    padding: "24px 24px 16px",
    borderBottom: "1px solid #e2e8f0",
  },
  lockIcon: { fontSize: "24px", marginBottom: "4px" },
  title: { fontSize: "20px", fontWeight: "700", color: "#1e293b", margin: 0 },
  closeBtn: {
    background: "none", border: "none", fontSize: "20px",
    cursor: "pointer", color: "#94a3b8", padding: "4px",
  },
  orderSummary: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "12px 24px",
    background: "linear-gradient(135deg, #667eea22, #764ba222)",
    borderBottom: "1px solid #e2e8f0",
  },
  orderLabel: { fontSize: "14px", color: "#475569", fontWeight: "500" },
  orderPrice: { fontSize: "18px", fontWeight: "700", color: "#667eea" },
  form: { padding: "20px 24px 24px", display: "flex", flexDirection: "column", gap: "16px" },
  field: { display: "flex", flexDirection: "column", gap: "6px" },
  row: { display: "flex", gap: "16px" },
  label: { fontSize: "13px", fontWeight: "600", color: "#374151" },
  input: {
    padding: "10px 14px",
    border: "1.5px solid #e2e8f0",
    borderRadius: "10px",
    fontSize: "15px",
    outline: "none",
    transition: "border-color 0.2s",
    width: "100%", boxSizing: "border-box",
  },
  inputError: { borderColor: "#ef4444" },
  select: {
    padding: "10px 14px",
    border: "1.5px solid #e2e8f0",
    borderRadius: "10px",
    fontSize: "14px",
    background: "white",
    cursor: "pointer",
  },
  cardInputWrapper: { position: "relative" },
  cardBrand: {
    position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)",
    fontWeight: "800", fontSize: "13px", letterSpacing: "1px",
  },
  error: { fontSize: "12px", color: "#ef4444" },
  simNote: {
    padding: "12px 14px",
    background: "#fffbeb",
    border: "1px solid #fcd34d",
    borderRadius: "10px",
    fontSize: "12px",
    color: "#92400e",
    lineHeight: "1.5",
  },
  payBtn: {
    padding: "14px",
    background: "linear-gradient(135deg, #667eea, #764ba2)",
    color: "white", border: "none",
    borderRadius: "12px",
    fontSize: "16px", fontWeight: "600",
    cursor: "pointer",
    width: "100%",
  },
  cancelBtn: {
    padding: "10px",
    background: "none", color: "#64748b",
    border: "1px solid #e2e8f0",
    borderRadius: "12px", fontSize: "14px",
    cursor: "pointer", width: "100%",
  },
  retryBtn: {
    padding: "12px",
    background: "#f1f5f9",
    color: "#1e293b",
    border: "none",
    borderRadius: "12px", fontSize: "14px", fontWeight: "600",
    cursor: "pointer", width: "100%", marginBottom: "8px",
  },
  processingContainer: {
    padding: "48px 24px",
    display: "flex", flexDirection: "column",
    alignItems: "center", gap: "16px",
  },
  spinner: {
    width: "48px", height: "48px",
    border: "4px solid #e2e8f0",
    borderTopColor: "#667eea",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
  processingText: { fontSize: "16px", fontWeight: "600", color: "#1e293b", margin: 0 },
  processingSubtext: { fontSize: "13px", color: "#94a3b8", margin: 0 },
  resultContainer: {
    padding: "32px 24px",
    display: "flex", flexDirection: "column",
    alignItems: "center", gap: "12px",
    textAlign: "center",
  },
  successIcon: { fontSize: "56px" },
  successTitle: { fontSize: "22px", fontWeight: "700", color: "#059669", margin: 0 },
  successMsg: { fontSize: "14px", color: "#475569", margin: 0 },
  receiptBox: {
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    padding: "16px",
    width: "100%",
    display: "flex", flexDirection: "column", gap: "10px",
    marginBottom: "8px",
  },
  receiptRow: {
    display: "flex", justifyContent: "space-between",
    fontSize: "13px", color: "#475569",
  },
  txId: {
    fontSize: "12px", background: "#e2e8f0",
    padding: "2px 8px", borderRadius: "6px",
    color: "#374151",
  },
  errorIcon: { fontSize: "56px" },
  errorTitle: { fontSize: "22px", fontWeight: "700", color: "#dc2626", margin: 0 },
  errorMsg: { fontSize: "14px", color: "#475569", margin: 0, marginBottom: "8px" },
};

export default PaymentModal;