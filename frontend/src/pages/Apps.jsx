import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Animate from "../components/Animate";
import SEO from "../components/SEO";
import { Link } from "react-router-dom";

const apps = [
  { icon: "📱", title: "Android App", desc: "Manage your gym on the go. Available on Google Play Store.", badge: "Coming Soon" },
  { icon: "🍎", title: "iOS App", desc: "Native iPhone experience for gym owners and staff.", badge: "Coming Soon" },
  { icon: "🖥️", title: "Web Dashboard", desc: "Full-featured browser dashboard — works on any device.", badge: "Live Now" },
];

export default function Apps() {
  return (
    <div className="bg-[#0E1011] text-white overflow-x-hidden" style={{ fontFamily: "var(--font-body)" }}>
      <Navbar />
      <SEO
        title="Apps — FlexOps on Web, Android & iOS"
        description="Access FlexOps gym management on any device. Full-featured web dashboard available now. Android and iOS apps coming soon."
        canonical="/apps"
        keywords="gym management app, gym app Android, gym app iOS, FlexOps mobile app"
      />

      <section className="max-w-6xl mx-auto px-6 pt-20 pb-14 text-center relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-64 bg-[#2DD4C4]/6 rounded-full blur-3xl pointer-events-none" />
        <Animate variant="fadeUp">
          <p className="label-tag mb-4">Apps</p>
          <h1 className="display-xl mb-5" style={{ fontFamily: "var(--font-display)" }}>
            FlexOps on every
            <br />
            <span className="text-shimmer">device you use.</span>
          </h1>
          <p className="body-lg max-w-lg mx-auto">
            Web, Android, iOS — manage your gym from anywhere.
          </p>
        </Animate>
      </section>

      <section className="max-w-6xl mx-auto px-6 pb-24">
        <div className="grid md:grid-cols-3 gap-6">
          {apps.map((a, i) => (
            <Animate key={a.title} variant="fadeUp" delay={i * 120}>
              <div className="card-premium text-center py-10">
                <span className="text-5xl animate-float inline-block mb-5">{a.icon}</span>
                <span
                  className="inline-block text-xs font-bold px-3 py-1 rounded-full mb-4"
                  style={
                    a.badge === "Live Now"
                      ? { background: "rgba(45,212,196,0.15)", color: "#2DD4C4" }
                      : { background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.4)" }
                  }
                >
                  {a.badge}
                </span>
                <h3 className="text-lg mb-2" style={{ fontWeight: 700 }}>{a.title}</h3>
                <p className="body-md text-sm">{a.desc}</p>
              </div>
            </Animate>
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-24 text-center">
        <Animate variant="scaleUp">
          <h2 className="display-md mb-6" style={{ fontFamily: "var(--font-display)" }}>
            Start with the web app today
          </h2>
          <Link to="/signup" className="btn-primary animate-pulse-glow">
            Get Started Free →
          </Link>
        </Animate>
      </section>

      <Footer />
    </div>
  );
}
