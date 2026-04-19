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
        </div>
      </div>

      {result.isGreenwashing && (
        <div className="greenwashing-alert">
          ⚠️ <strong>Potential Greenwashing:</strong> {result.greenwashingExplanation}
        </div>
      )}

      <p className="scan-summary">{result.summary}</p>

      {result.estimatedCarbonKg !== undefined && (
        <div className="scan-section" style={{ background: '#000', color: '#fff', padding: '12px', marginTop: '14px', border: '3px solid var(--border)' }}>
          <h4 style={{ color: '#aaa', marginBottom: '4px' }}>ESTIMATED CO₂e FOOTPRINT</h4>
          <div style={{ fontSize: '1.4rem', fontFamily: 'var(--font-retro)' }}>{result.estimatedCarbonKg} kg</div>
        </div>
      )}

      {result.emissionsBreakdown && (
        <div className="scan-section scan-section--concerns">
          <h4>Emissions Breakdown</h4>
          <ul style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <li>🏭 <strong>Manufacturing:</strong> {result.emissionsBreakdown.manufacturing}</li>
            <li>🚚 <strong>Transport:</strong> {result.emissionsBreakdown.transport}</li>
            <li>♻️ <strong>End of Life:</strong> {result.emissionsBreakdown.endOfLife}</li>
          </ul>
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
