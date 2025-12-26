import { Link } from "react-router-dom";
import { Users, Briefcase, Brain, CheckCircle } from "lucide-react";

const Home = () => {
  return (
    <div className="min-h-screen bg-slate-50 text-gray-800">

      {/* ================= HERO ================= */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-700 via-indigo-700 to-purple-700 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.15),_transparent_60%)]" />

        <div className="relative max-w-7xl mx-auto px-6 py-28 text-center">
          <span className="inline-block mb-4 px-4 py-1 text-sm rounded-full bg-white/10 backdrop-blur">
            Enterprise Skill Intelligence Platform
          </span>

          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6">
            SkillMatch <span className="text-blue-200">Pro</span>
          </h1>

          <p className="max-w-3xl mx-auto text-lg md:text-xl text-blue-100 mb-10">
            Build high-performing teams by intelligently matching people,
            skills, and projects — faster and smarter.
          </p>

          <div className="flex justify-center gap-4 flex-wrap">
            <Link
              to="/personnel"
              className="bg-white text-blue-700 px-8 py-4 rounded-xl font-semibold shadow-lg hover:scale-105 transition"
            >
              Manage Personnel
            </Link>

            <Link
              to="/projects"
              className="bg-white/10 backdrop-blur border border-white/30 px-8 py-4 rounded-xl font-semibold hover:bg-white hover:text-blue-700 transition"
            >
              Explore Projects
            </Link>
          </div>
        </div>
      </section>

      {/* ================= ABOUT ================= */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Designed for Modern IT Teams
          </h2>

          <p className="text-gray-600 max-w-3xl mx-auto text-lg">
            SkillMatch Pro helps consultancies and tech organizations manage
            talent efficiently by centralizing skills, roles, and project
            requirements in one intelligent system.
          </p>
        </div>
      </section>

      {/* ================= FEATURES ================= */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-16">
            Powerful Core Features
          </h2>

          <div className="grid gap-10 md:grid-cols-3">
            {/* Feature Card */}
            <FeatureCard
              icon={<Users size={32} />}
              title="Personnel Management"
              description="Centralized employee profiles with roles, experience, and availability tracking."
            />

            <FeatureCard
              icon={<Brain size={32} />}
              title="Skill Intelligence"
              description="Structured skill mapping with proficiency levels for precise matching."
            />

            <FeatureCard
              icon={<Briefcase size={32} />}
              title="Smart Project Matching"
              description="Automatically assign the right talent to the right projects using logic-based matching."
            />
          </div>
        </div>
      </section>

      {/* ================= WORKFLOW ================= */}
      <section className="py-20 bg-slate-100">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-12">
            How It Works
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <WorkflowStep
              step="01"
              text="Add personnel and define skills"
            />
            <WorkflowStep
              step="02"
              text="Create projects with skill requirements"
            />
            <WorkflowStep
              step="03"
              text="Match and deploy the best team instantly"
            />
          </div>
        </div>
      </section>

      {/* ================= CTA ================= */}
      <section className="py-24 bg-gradient-to-r from-blue-700 to-indigo-700 text-white">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Start Building Smarter Teams Today
          </h2>

          <p className="text-blue-100 text-lg mb-10">
            Gain full visibility into your talent pool and deliver projects
            with confidence.
          </p>

          <Link
            to="/personnel"
            className="inline-flex items-center gap-2 bg-white text-blue-700 px-10 py-4 rounded-xl font-semibold shadow-lg hover:scale-105 transition"
          >
            <CheckCircle />
            Add Your First Team Member
          </Link>
        </div>
      </section>
    </div>
  );
};

/* ================= COMPONENTS ================= */

const FeatureCard = ({ icon, title, description }) => (
  <div className="group p-8 rounded-2xl border bg-white shadow-sm hover:shadow-xl hover:-translate-y-2 transition">
    <div className="text-blue-600 mb-4">{icon}</div>
    <h3 className="text-xl font-semibold mb-3">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
);

const WorkflowStep = ({ step, text }) => (
  <div className="p-8 bg-white rounded-2xl shadow-sm text-center">
    <div className="text-4xl font-extrabold text-blue-600 mb-4">
      {step}
    </div>
    <p className="text-gray-700 text-lg">{text}</p>
  </div>
);

export default Home;
