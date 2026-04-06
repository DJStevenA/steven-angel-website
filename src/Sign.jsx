import { useState } from "react";

const BG = "#04040f";
const C  = "#00E5FF";
const P  = "#BB86FC";
const API = import.meta.env.VITE_API_URL || "https://ghost-backend-production-adb6.up.railway.app";

const PACKAGES = {
  demo:  { name: "Demo Finishing",            price: 300  },
  full:  { name: "Full Production",            price: 800  },
  vocal: { name: "Full Production with Vocal", price: 1500 },
};

export default function Sign() {
  const params  = new URLSearchParams(window.location.search);
  const pkg     = params.get("package") || "full";
  const info    = PACKAGES[pkg] || PACKAGES.full;
  const fee     = Math.round(info.price * 0.035 * 100) / 100;
  const total   = (info.price + fee).toFixed(2);
  const date    = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  const [clientName,  setClientName]  = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [status,      setStatus]      = useState("ready");
  const [signedData,  setSignedData]  = useState(null);

  const handleSign = async () => {
    if (!clientName.trim() || !clientEmail.trim()) return alert("Please fill in your name and email.");
    setStatus("signing");
    try {
      const r = await fetch(`${API}/sign-first`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ package: pkg, clientName, clientEmail }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || "Failed");
      setSignedData(data);
      setStatus("signed");
      if (window.gtag) {
        window.gtag('event', 'conversion', {
          'send_to': 'AW-999991173',
          'value': pkg === 'demo' ? 300 : pkg === 'full' ? 800 : 1500,
          'currency': 'USD',
          'event_category': 'lead',
          'event_label': `sign_${pkg}`,
        });
      }
    } catch (err) {
      alert("Something went wrong: " + err.message);
      setStatus("ready");
    }
  };

  const s = {
    page:   { background: BG, minHeight: "100vh", color: "#fff", fontFamily: "DM Sans, sans-serif", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 20px" },
    box:    { maxWidth: 680, width: "100%", background: "#07070f", border: "1px solid #1a1a2e", borderRadius: 12, padding: "48px 40px" },
    title:  { fontFamily: "Barlow Condensed, sans-serif", fontWeight: 900, fontSize: 32, letterSpacing: "0.05em", marginBottom: 4 },
    label:  { fontSize: 11, letterSpacing: "0.12em", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", marginBottom: 6, display: "block" },
    clause: { marginBottom: 16 },
    ctitle: { fontWeight: 700, fontSize: 13, marginBottom: 2 },
    ctext:  { fontSize: 13, color: "rgba(255,255,255,0.7)", lineHeight: 1.6 },
    input:  { width: "100%", background: "#0b0b18", border: "1px solid #1a1a2e", borderRadius: 6, padding: "12px 16px", color: "#fff", fontFamily: "DM Sans, sans-serif", fontSize: 14, outline: "none", boxSizing: "border-box" },
    btn:    { width: "100%", background: C, color: "#000", border: "none", borderRadius: 6, padding: "16px", fontFamily: "Barlow Condensed, sans-serif", fontWeight: 900, fontSize: 16, letterSpacing: "0.1em", cursor: "pointer", marginTop: 8 },
  };

  const clauses = [
    ["1. Confidentiality", "Both parties agree to keep all communications, project details, and the existence of this agreement strictly confidential. The Producer will never publicly disclose, claim credit for, or reference the Track in any form."],
    ["2. Copyright Transfer", "Upon receipt of full payment, the Producer transfers 100% of the copyright, master rights, and publishing rights of the Track to the Artist. The Artist is the sole legal owner."],
    ["3. Artist Credit", "The Track will be released solely under the Artist's name. The Producer's name will not appear on any release, credits, or promotional material."],
    ["4. Exclusivity", "The Track is produced exclusively for the Artist and will not be sold, licensed, or shared with any other party."],
    ["5. Scope of Production", "The Producer will deliver a fully produced track including composition, arrangement, mixing, and mastering \u2014 ready for release on all major platforms."],
    ["6. Royalty-Free Content", "All samples, loops, instruments, and sound design elements used in the production are 100% royalty-free and cleared for commercial release on any platform worldwide."],
    ["7. Revisions", "The Artist is entitled to revisions as agreed in the package. Additional revisions may be subject to extra fees."],
    ["8. Deliverables", info.price >= 800
      ? "The Producer will deliver: Extended Edit (Mastered WAV + MP3), Radio Edit (Mastered WAV + MP3), PreMaster WAV (Unmastered), Stems, and MIDI files."
      : "The Producer will deliver: Mastered WAV, Mastered MP3, PreMaster WAV (Unmastered), and Stems."],
    ["9. Payment", `The agreed fee for this production is $${info.price} USD + $${fee} PayPal processing fee = $${total} USD total.`],
    ["10. No Refunds", "Due to the custom nature of ghost production, payments are non-refundable once work has commenced."],
    ["11. Governing Law", "This agreement is governed by the laws of Israel."],
  ];

  return (
    <div style={s.page}>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;900&family=DM+Sans:wght@400;500&display=swap" />
      <div style={s.box}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ fontSize: 11, letterSpacing: "0.2em", color: C, marginBottom: 8 }}>GHOST PRODUCTION AGREEMENT</div>
          <div style={s.title}>Non-Disclosure &<br />Copyright Transfer</div>
          <div style={{ marginTop: 20, display: "flex", justifyContent: "center", gap: 32, fontSize: 13, color: "rgba(255,255,255,0.5)", flexWrap: "wrap" }}>
            <span>{info.name}</span>
            <span>${info.price} USD</span>
            <span>{date}</span>
          </div>
        </div>

        {/* Parties */}
        <div style={{ background: "#0b0b18", border: "1px solid #1a1a2e", borderRadius: 8, padding: "16px 20px", marginBottom: 32, fontSize: 13, color: "rgba(255,255,255,0.6)" }}>
          <strong style={{ color: "#fff" }}>Between:</strong> Steven Angel ("Producer") <strong style={{ color: "#fff" }}>and</strong> you ("Artist")
        </div>

        {/* Clauses */}
        <div style={{ marginBottom: 32 }}>
          {clauses.map(([title, text]) => (
            <div key={title} style={s.clause}>
              <div style={s.ctitle}>{title}</div>
              <div style={s.ctext}>{text}</div>
            </div>
          ))}
        </div>

        {/* Sign Section */}
        <div style={{ borderTop: "1px solid #1a1a2e", paddingTop: 32 }}>
          <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, fontSize: 18, marginBottom: 8 }}>Sign the Agreement</div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginBottom: 24 }}>After signing you'll be redirected to complete payment via PayPal.</div>

          <div style={{ marginBottom: 16 }}>
            <label style={s.label}>Your Full Name</label>
            <input style={s.input} value={clientName} onChange={e => setClientName(e.target.value)} placeholder="Enter your full name" />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={s.label}>Your Email (to receive a copy)</label>
            <input style={s.input} type="email" value={clientEmail} onChange={e => setClientEmail(e.target.value)} placeholder="your@email.com" />
          </div>

          {/* Signature Preview */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
            <div style={{ background: "#0b0b18", border: "1px solid #1a1a2e", borderRadius: 8, padding: "16px 20px" }}>
              <div style={s.label}>Producer</div>
              <div style={{ fontSize: 22, fontStyle: "italic", color: C }}>Steven Angel</div>
            </div>
            <div style={{ background: "#0b0b18", border: "1px solid #1a1a2e", borderRadius: 8, padding: "16px 20px" }}>
              <div style={s.label}>Artist</div>
              <div style={{ fontSize: 18, color: clientName ? "#fff" : "rgba(255,255,255,0.2)" }}>
                {clientName || "Your name above"}
              </div>
            </div>
          </div>

          {status === "signed" && signedData ? (
            <div style={{ marginTop: 8 }}>
              <div style={{ background: "#0b1a0b", border: "1px solid #1a3a1a", borderRadius: 8, padding: "20px", marginBottom: 16 }}>
                <div style={{ fontSize: 12, letterSpacing: "0.1em", color: "#4CAF50", marginBottom: 16 }}>AGREEMENT SIGNED</div>
                {signedData.pdfToken && (
                  <a
                    href={`${API}/download-pdf/${signedData.pdfToken}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{ display: "block", background: C, color: "#000", borderRadius: 6, padding: "12px 16px", textDecoration: "none", fontSize: 13, fontWeight: 700, textAlign: "center", marginBottom: 8, fontFamily: "Barlow Condensed, sans-serif", letterSpacing: "0.08em" }}
                  >
                    DOWNLOAD CONTRACT (PDF) ↓
                  </a>
                )}
                {signedData.uploadUrl && (
                  <a
                    href={signedData.uploadUrl}
                    target="_blank"
                    rel="noreferrer"
                    style={{ display: "block", background: "#1a1a2e", border: `1px solid ${P}`, color: P, borderRadius: 6, padding: "12px 16px", textDecoration: "none", fontSize: 13, fontWeight: 700, textAlign: "center", marginBottom: 8, fontFamily: "Barlow Condensed, sans-serif", letterSpacing: "0.08em" }}
                  >
                    YOUR DROPBOX FOLDER →
                  </a>
                )}
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", textAlign: "center" }}>The contract + folder link will be sent to your email</div>
              </div>
              <button style={s.btn} onClick={() => { window.location.href = signedData.paypalUrl; }}>
                PROCEED TO PAYMENT →
              </button>
            </div>
          ) : (
            <>
              <button style={{ ...s.btn, opacity: status === "signing" ? 0.7 : 1 }} onClick={handleSign} disabled={status === "signing"}>
                {status === "signing" ? "Processing..." : "I AGREE & SIGN \u2014 PROCEED TO PAYMENT \u2192"}
              </button>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", textAlign: "center", marginTop: 12 }}>
                By clicking above you confirm you have read and agree to all terms.
              </div>
            </>
          )}

          <div style={{ textAlign: "center", marginTop: 20 }}>
            <a href="/ghost" style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", textDecoration: "none" }}>&larr; Back to packages</a>
          </div>
        </div>
      </div>
    </div>
  );
}
