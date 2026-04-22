import { useState } from "react";

const TARGET_TYPES = ["TLS", "SSH"];
const TLS_SCAN_URL = "http://localhost:8080/api/v1/scan/tls";

function SeverityBadge({ severity }) {
  const value = severity || "Unknown";
  const normalized = String(value).toLowerCase();
  return <span className={`severity severity-${normalized}`}>{value}</span>;
}

function ListBlock({ title, items }) {
  if (!Array.isArray(items) || items.length === 0) {
    return null;
  }

  return (
    <div className="list-block">
      <strong>{title}</strong>
      <ul>
        {items.map((item, index) => (
          <li key={`${title}-${index}`}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

function QuantumAssessmentPanel({ assessments, title }) {
  if (!Array.isArray(assessments) || assessments.length === 0) {
    return null;
  }

  return (
    <details className="details-block">
      <summary>{title}</summary>
      <div className="details-content">
        {assessments.map((assessment, index) => (
          <div key={`${assessment.Asset || "asset"}-${index}`} className="assessment-card">
            <div className="assessment-head">
              <strong>{assessment.Asset || "Unknown Asset"}</strong>
              <SeverityBadge severity={assessment.Severity} />
            </div>
            <ListBlock title="Findings" items={assessment.Findings} />
            <ListBlock title="Description" items={assessment.Description} />
            <ListBlock title="Risks" items={assessment.Risks} />
          </div>
        ))}
      </div>
    </details>
  );
}

function PerVersionPanel({ versions }) {
  if (!Array.isArray(versions) || versions.length === 0) {
    return null;
  }

  return (
    <details className="details-block" open>
      <summary>Cipher Suite Per Version</summary>
      <div className="details-content">
        {versions.map((versionInfo, index) => (
          <details className="details-block nested" key={`${versionInfo.Version || "TLS"}-${index}`}>
            <summary>{versionInfo.Version || "Unknown Version"}</summary>
            <div className="details-content">
              <div className="kv-grid">
                <p>
                  <strong>Key Exchange Types:</strong>{" "}
                  {Array.isArray(versionInfo.KeyExchangeTypes)
                    ? versionInfo.KeyExchangeTypes.join(", ")
                    : "N/A"}
                </p>
                <p>
                  <strong>Authentication Types:</strong>{" "}
                  {Array.isArray(versionInfo.AuthenticationTypes)
                    ? versionInfo.AuthenticationTypes.join(", ")
                    : "N/A"}
                </p>
                <p>
                  <strong>Static RSA Key Exchange Present:</strong>{" "}
                  {String(versionInfo.StaticRSAKeyExchangePresent)}
                </p>
                <p>
                  <strong>Forward Secrecy Present:</strong> {String(versionInfo.ForwardSecrecyPresent)}
                </p>
                <p>
                  <strong>All Key Exchanges Classical:</strong>{" "}
                  {String(versionInfo.AllKeyExchangesClassical)}
                </p>
                <p>
                  <strong>All Authentication Classical:</strong>{" "}
                  {String(versionInfo.AllAuthenticationClassical)}
                </p>
                <p>
                  <strong>TLS 1.3 Cipher:</strong> {String(versionInfo.TLS13Cipher)}
                </p>
              </div>
              <QuantumAssessmentPanel
                assessments={versionInfo.QuantumAssessment}
                title="Version Quantum Assessment"
              />
            </div>
          </details>
        ))}
      </div>
    </details>
  );
}

export default function App() {
  const [targetType, setTargetType] = useState("TLS");
  const [hostname, setHostname] = useState("");
  const [port, setPort] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [scanResult, setScanResult] = useState(null);

  const handleScan = async () => {
    if (targetType !== "TLS") {
      return;
    }

    setError("");
    setScanResult(null);
    setLoading(true);

    try {
      const response = await fetch(TLS_SCAN_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          host_name: hostname.trim(),
          port: Number(port)
        })
      });

      if (!response.ok) {
        throw new Error(`Scan API failed with status ${response.status}`);
      }

      const data = await response.json();
      setScanResult(data);
    } catch (scanError) {
      setError(scanError.message || "Failed to fetch scan results.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">PostQ</div>
        <button
          type="button"
          className="menu-item active"
        >
          Scan
        </button>
      </aside>

      <main className="content">
        <>
          <section className="card">
            <h1>Scan</h1>

            <div className="scan-row">
              <div className="field">
                <label htmlFor="targetType">Target type</label>
                <select
                  id="targetType"
                  value={targetType}
                  onChange={(e) => setTargetType(e.target.value)}
                >
                  {TARGET_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label htmlFor="hostname">Hostname</label>
                <input
                  id="hostname"
                  type="text"
                  placeholder="example.com"
                  value={hostname}
                  onChange={(e) => setHostname(e.target.value)}
                />
              </div>

              <div className="field">
                <label htmlFor="port">Port</label>
                <input
                  id="port"
                  type="number"
                  placeholder={targetType === "TLS" ? "443" : "22"}
                  value={port}
                  onChange={(e) => setPort(e.target.value)}
                />
              </div>

              <div className="field action-field">
                <button
                  type="button"
                  className="scan-button"
                  onClick={handleScan}
                  disabled={targetType === "SSH" || loading || !hostname.trim() || !port}
                >
                  {loading ? "Scanning..." : "Scan"}
                </button>
              </div>
            </div>

            {targetType === "SSH" && (
              <p className="info-text">SSH scan UI is not enabled yet. Please select TLS.</p>
            )}
            {error && <p className="error-text">{error}</p>}
          </section>

          {scanResult && (
            <section className="results-card">
              <h2>TLS Scan Results</h2>
              <div className="kv-grid">
                <p>
                  <strong>Host:</strong> {scanResult.Host || "N/A"}
                </p>
              </div>

                <details className="details-block" open>
                  <summary>Protocol</summary>
                  <div className="details-content">
                    <div className="kv-grid">
                      <p>
                        <strong>Highest Version:</strong> {scanResult.Protocol?.HighestVersion || "N/A"}
                      </p>
                      <p>
                        <strong>Lowest Version:</strong> {scanResult.Protocol?.LowestVersion || "N/A"}
                      </p>
                      <p>
                        <strong>TLS 1.3 Enabled:</strong> {String(scanResult.Protocol?.TLS13Enabled)}
                      </p>
                      <p>
                        <strong>TLS 1.2 Enabled:</strong> {String(scanResult.Protocol?.TLS12Enabled)}
                      </p>
                      <p>
                        <strong>Legacy Enabled:</strong> {String(scanResult.Protocol?.LegacyEnabled)}
                      </p>
                      <p>
                        <strong>Classical Fallback Present:</strong>{" "}
                        {String(scanResult.Protocol?.ClassicalFallbackPresent)}
                      </p>
                      <p>
                        <strong>PQ Migration Ready:</strong>{" "}
                        {String(scanResult.Protocol?.PQMigrationReady)}
                      </p>
                      <p>
                        <strong>Hybrid Bypass Surface:</strong>{" "}
                        {String(scanResult.Protocol?.HybridBypassSurface)}
                      </p>
                    </div>
                    <QuantumAssessmentPanel
                      assessments={scanResult.Protocol?.QuantumAssessment}
                      title="Protocol Quantum Assessment"
                    />
                  </div>
                </details>

                <details className="details-block" open>
                  <summary>Cipher Suite</summary>
                  <div className="details-content">
                    <div className="kv-grid">
                      <p>
                        <strong>Any Static RSA:</strong> {String(scanResult.CipherSuite?.AnyStaticRSA)}
                      </p>
                      <p>
                        <strong>Any Forward Secrecy:</strong>{" "}
                        {String(scanResult.CipherSuite?.AnyForwardSecrecy)}
                      </p>
                      <p>
                        <strong>All Key Exchanges Classical:</strong>{" "}
                        {String(scanResult.CipherSuite?.AllKeyExchangesClassical)}
                      </p>
                      <p>
                        <strong>All Authentication Classical:</strong>{" "}
                        {String(scanResult.CipherSuite?.AllAuthenticationClassical)}
                      </p>
                      <p>
                        <strong>Harvest Now Decrypt Later Risk:</strong>{" "}
                        {String(scanResult.CipherSuite?.HarvestNowDecryptLaterRisk)}
                      </p>
                    </div>

                    <QuantumAssessmentPanel
                      assessments={scanResult.CipherSuite?.QuantumAssessment}
                      title="Cipher Suite Quantum Assessment"
                    />

                    <PerVersionPanel versions={scanResult.CipherSuite?.PerVersion} />
                  </div>
                </details>
            </section>
          )}
        </>
      </main>
    </div>
  );
}
