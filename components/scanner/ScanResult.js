'use client';

const GRADE_COLORS = { A: '#10b981', B: '#84cc16', C: '#f59e0b', D: '#ef4444', F: '#7f1d1d' };

export default function ScanResult({ result, onEarnXp }) {
  if (!result) return null;

  const gradeColor = GRADE_COLORS[result.grade] ?? '#6b7280';

  return (
    <div className="scan-result">
      <div className="scan-grade-row">
        <div className="scan-grade" style={{ background: gradeColor }}>
          {result.grade}
        </div>
        <div className="scan-product-info">
          <h3>{result.productName}</h3>
          <span className={`carbon-pill carbon-pill--${result.carbonImpact}`}>
            {result.carbonImpact} carbon impact
          </span>
        </div>
      </div>

      {result.isGreenwashing && (
        <div className="greenwashing-alert">
          ⚠️ <strong>Potential Greenwashing:</strong> {result.greenwashingExplanation}
        </div>
      )}

      <p className="scan-summary">{result.summary}</p>

      {result.materials?.length > 0 && (
        <div className="scan-section">
          <h4>Materials</h4>
          <ul>{result.materials.map((m, i) => <li key={i}>{m}</li>)}</ul>
        </div>
      )}

      {result.concerns?.length > 0 && (
        <div className="scan-section scan-section--concerns">
          <h4>Concerns</h4>
          <ul>{result.concerns.map((c, i) => <li key={i}>⚠️ {c}</li>)}</ul>
        </div>
      )}

      {result.alternatives?.length > 0 && (
        <div className="scan-section scan-section--alternatives">
          <h4>Better alternatives</h4>
          <ul>{result.alternatives.map((a, i) => <li key={i}>✅ {a}</li>)}</ul>
        </div>
      )}

      {result.xpReward > 0 && (
        <button className="btn-primary" onClick={() => onEarnXp(result.xpReward)}>
          Earn +{result.xpReward} XP for scanning ✨
        </button>
      )}
    </div>
  );
}
