/**
 * Responsive, Interactive SVG Bar/Area Chart for Revenue & Volume Trends
 */
export function RevenueMarginChart({ volume = 0, margin = 0, savings = 0 }) {
  // Generate data points for simulated trend
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"];
  const maxVal = Math.max(volume, 100000);

  const pointsVolume = [0.4, 0.55, 0.65, 0.7, 0.85, 0.9, 0.95, 1.0].map(
    (m) => volume * m,
  );
  const pointsMargin = [0.35, 0.5, 0.6, 0.68, 0.82, 0.88, 0.92, 1.0].map(
    (m) => margin * m,
  );
  const pointsSavings = [0.4, 0.52, 0.62, 0.72, 0.84, 0.91, 0.96, 1.0].map(
    (m) => savings * m,
  );

  const chartHeight = 180;
  const chartWidth = 500;

  const getY = (val) => chartHeight - (val / (maxVal * 1.1)) * chartHeight;
  const getX = (idx) => (idx / (months.length - 1)) * (chartWidth - 40) + 20;

  const volPath = pointsVolume
    .map((v, i) => `${i === 0 ? "M" : "L"} ${getX(i)} ${getY(v)}`)
    .join(" ");
  const marginPath = pointsMargin
    .map((v, i) => `${i === 0 ? "M" : "L"} ${getX(i)} ${getY(v)}`)
    .join(" ");
  const savingsPath = pointsSavings
    .map((v, i) => `${i === 0 ? "M" : "L"} ${getX(i)} ${getY(v)}`)
    .join(" ");

  return (
    <div
      style={{
        background: "#0b0f19",
        borderRadius: "16px",
        padding: "20px",
        border: "1px solid #1e293b",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "16px",
        }}
      >
        <div>
          <h4
            style={{
              color: "#f8fafc",
              fontSize: "15px",
              fontWeight: "700",
              margin: 0,
            }}
          >
            Financial Trends & Revenue Performance
          </h4>
          <span style={{ color: "#94a3b8", fontSize: "12px" }}>
            Real-time platform volume, margin & customer savings breakdown
          </span>
        </div>
        <div style={{ display: "flex", gap: "16px", fontSize: "12px" }}>
          <span
            style={{
              color: "#10b981",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <span
              style={{
                width: "10px",
                height: "10px",
                borderRadius: "50%",
                background: "#10b981",
              }}
            ></span>{" "}
            Bill Volume
          </span>
          <span
            style={{
              color: "#06b6d4",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <span
              style={{
                width: "10px",
                height: "10px",
                borderRadius: "50%",
                background: "#06b6d4",
              }}
            ></span>{" "}
            Cheepper Revenue
          </span>
          <span
            style={{
              color: "#f59e0b",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <span
              style={{
                width: "10px",
                height: "10px",
                borderRadius: "50%",
                background: "#f59e0b",
              }}
            ></span>{" "}
            Customer Savings
          </span>
        </div>
      </div>

      <div style={{ position: "relative", width: "100%", overflowX: "auto" }}>
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight + 30}`}
          style={{ width: "100%", height: "auto", minWidth: "400px" }}
        >
          {/* Horizontal grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => (
            <line
              key={idx}
              x1="0"
              y1={chartHeight * (1 - pct)}
              x2={chartWidth}
              y2={chartHeight * (1 - pct)}
              stroke="#1e293b"
              strokeDasharray="4 4"
            />
          ))}

          {/* Area gradients */}
          <defs>
            <linearGradient id="volGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="marginGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Area fills */}
          <path
            d={`${volPath} L ${getX(months.length - 1)} ${chartHeight} L ${getX(0)} ${chartHeight} Z`}
            fill="url(#volGrad)"
          />
          <path
            d={`${marginPath} L ${getX(months.length - 1)} ${chartHeight} L ${getX(0)} ${chartHeight} Z`}
            fill="url(#marginGrad)"
          />

          {/* Trend lines */}
          <path
            d={volPath}
            fill="none"
            stroke="#10b981"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path
            d={marginPath}
            fill="none"
            stroke="#06b6d4"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <path
            d={savingsPath}
            fill="none"
            stroke="#f59e0b"
            strokeWidth="2"
            strokeDasharray="5 5"
          />

          {/* Interactive Data Dots */}
          {pointsVolume.map((v, i) => (
            <circle
              key={`v-${i}`}
              cx={getX(i)}
              cy={getY(v)}
              r="4"
              fill="#10b981"
              stroke="#0b0f19"
              strokeWidth="2"
            />
          ))}
          {pointsMargin.map((v, i) => (
            <circle
              key={`m-${i}`}
              cx={getX(i)}
              cy={getY(v)}
              r="4"
              fill="#06b6d4"
              stroke="#0b0f19"
              strokeWidth="2"
            />
          ))}

          {/* Month labels */}
          {months.map((m, idx) => (
            <text
              key={idx}
              x={getX(idx)}
              y={chartHeight + 20}
              fill="#94a3b8"
              fontSize="11"
              textAnchor="middle"
              fontWeight="600"
            >
              {m}
            </text>
          ))}
        </svg>
      </div>
    </div>
  );
}

/**
 * Donut Chart for Transaction Status Breakdown
 */
export function TransactionStatusDonut({
  successCount = 0,
  failedCount = 0,
  processingCount = 0,
}) {
  const total = successCount + failedCount + processingCount || 1;
  const succPct = Math.round((successCount / total) * 100);
  const failPct = Math.round((failedCount / total) * 100);
  const procPct = Math.max(0, 100 - succPct - failPct);

  return (
    <div
      style={{
        background: "#0b0f19",
        borderRadius: "16px",
        padding: "20px",
        border: "1px solid #1e293b",
        height: "100%",
      }}
    >
      <h4
        style={{
          color: "#f8fafc",
          fontSize: "15px",
          fontWeight: "700",
          marginBottom: "16px",
        }}
      >
        Transaction Success Distribution
      </h4>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-around",
          gap: "20px",
        }}
      >
        {/* SVG Donut */}
        <div style={{ position: "relative", width: "130px", height: "130px" }}>
          <svg
            viewBox="0 0 36 36"
            style={{
              width: "100%",
              height: "100%",
              transform: "rotate(-90deg)",
            }}
          >
            {/* Background ring */}
            <circle
              cx="18"
              cy="18"
              r="15.915"
              fill="none"
              stroke="#1e293b"
              strokeWidth="3.8"
            />

            {/* Success Segment */}
            <circle
              cx="18"
              cy="18"
              r="15.915"
              fill="none"
              stroke="#10b981"
              strokeWidth="3.8"
              strokeDasharray={`${succPct} ${100 - succPct}`}
              strokeDashoffset="0"
            />
            {/* Failed Segment */}
            <circle
              cx="18"
              cy="18"
              r="15.915"
              fill="none"
              stroke="#ef4444"
              strokeWidth="3.8"
              strokeDasharray={`${failPct} ${100 - failPct}`}
              strokeDashoffset={`-${succPct}`}
            />
          </svg>
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span
              style={{ fontSize: "20px", fontWeight: "900", color: "#10b981" }}
            >
              {succPct}%
            </span>
            <span
              style={{
                fontSize: "10px",
                color: "#94a3b8",
                textTransform: "uppercase",
              }}
            >
              Success
            </span>
          </div>
        </div>

        {/* Legend */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            fontSize: "13px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span
              style={{
                width: "10px",
                height: "10px",
                borderRadius: "50%",
                background: "#10b981",
              }}
            />
            <div>
              <div style={{ color: "#f8fafc", fontWeight: "bold" }}>
                {successCount} Success
              </div>
              <div style={{ color: "#94a3b8", fontSize: "11px" }}>
                {succPct}% Completion
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span
              style={{
                width: "10px",
                height: "10px",
                borderRadius: "50%",
                background: "#ef4444",
              }}
            />
            <div>
              <div style={{ color: "#f8fafc", fontWeight: "bold" }}>
                {failedCount} Failed
              </div>
              <div style={{ color: "#94a3b8", fontSize: "11px" }}>
                {failPct}% Failure Rate
              </div>
            </div>
          </div>

          {processingCount > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span
                style={{
                  width: "10px",
                  height: "10px",
                  borderRadius: "50%",
                  background: "#f59e0b",
                }}
              />
              <div>
                <div style={{ color: "#f8fafc", fontWeight: "bold" }}>
                  {processingCount} In Recovery
                </div>
                <div style={{ color: "#94a3b8", fontSize: "11px" }}>
                  {procPct}% Pending
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Bar Chart for API Provider Latency & Reliability Comparison
 */
export function ProviderLatencyChart({ providers = [] }) {
  return (
    <div
      style={{
        background: "#0b0f19",
        borderRadius: "16px",
        padding: "20px",
        border: "1px solid #1e293b",
      }}
    >
      <h4
        style={{
          color: "#f8fafc",
          fontSize: "15px",
          fontWeight: "700",
          marginBottom: "16px",
        }}
      >
        API Service Provider Response Latency (ms)
      </h4>
      <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        {providers.map((p) => {
          const latency = p.avg_latency_ms || 300;
          const maxLat = 800;
          const pct = Math.min(100, Math.round((latency / maxLat) * 100));
          const isFast = latency < 350;
          const isModerate = latency >= 350 && latency < 550;
          const barColor = isFast
            ? "#10b981"
            : isModerate
              ? "#f59e0b"
              : "#ef4444";

          return (
            <div key={p.code}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "12px",
                  marginBottom: "6px",
                }}
              >
                <span style={{ color: "#f8fafc", fontWeight: "bold" }}>
                  {p.name} ({p.code})
                </span>
                <span style={{ color: barColor, fontWeight: "bold" }}>
                  {latency} ms · {p.success_rate_pct}% Uptime
                </span>
              </div>
              <div
                style={{
                  height: "10px",
                  background: "#1e293b",
                  borderRadius: "5px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${pct}%`,
                    height: "100%",
                    background: barColor,
                    borderRadius: "5px",
                    transition: "width 0.6s ease",
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
