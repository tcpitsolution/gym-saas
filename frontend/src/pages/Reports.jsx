import Layout from "../components/Layout";
import Animate from "../components/Animate";

export default function Reports() {
  return (
    <Layout>
      <Animate variant="fadeUp">
        <div className="mb-8">
          <h1 className="text-3xl mb-1" style={{ fontFamily: "var(--font-display)", fontWeight: 900, color: "#fff" }}>
            Reports
          </h1>
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>Detailed analytics and insights</p>
        </div>
      </Animate>

      <Animate variant="fadeUp" delay={100}>
        <div
          className="rounded-2xl p-12 text-center"
          style={{ background: "#16191B", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          <p className="text-5xl mb-4 animate-float inline-block">📊</p>
          <h2 className="text-xl font-semibold mb-2" style={{ color: "#fff" }}>Detailed reports coming soon</h2>
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
            Revenue breakdowns, member trends, and more — launching shortly.
          </p>
        </div>
      </Animate>
    </Layout>
  );
}
