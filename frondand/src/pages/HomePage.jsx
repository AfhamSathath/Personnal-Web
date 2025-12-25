import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-20">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            SkillMatch Pro
          </h1>
          <p className="text-lg md:text-xl mb-8">
            Manage personnel skills and match the right people to the right projects.
          </p>

          <div className="flex justify-center gap-4">
            <Link
              to="/personnel"
              className="bg-white text-blue-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
            >
              Manage Personnel
            </Link>

            <Link
              to="/projects"
              className="border border-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-700 transition"
            >
              View Projects
            </Link>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4 text-gray-800">
            About the Platform
          </h2>
          <p className="text-gray-600 max-w-3xl mx-auto">
            This system helps small consultancies and tech agencies efficiently
            manage their personnel, track skills, and intelligently match team
            members to project requirements—saving time and improving project success.
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
            Core Features
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 border rounded-xl shadow-sm hover:shadow-md transition">
              <h3 className="text-xl font-semibold mb-2 text-blue-600">
                Personnel Management
              </h3>
              <p className="text-gray-600">
                Create, update, and manage personnel profiles including roles,
                experience levels, and contact details.
              </p>
            </div>

            <div className="p-6 border rounded-xl shadow-sm hover:shadow-md transition">
              <h3 className="text-xl font-semibold mb-2 text-blue-600">
                Skill Tracking
              </h3>
              <p className="text-gray-600">
                Assign technical and soft skills to employees and categorize
                them for better visibility and searching.
              </p>
            </div>

            <div className="p-6 border rounded-xl shadow-sm hover:shadow-md transition">
              <h3 className="text-xl font-semibold mb-2 text-blue-600">
                Smart Skill Matching
              </h3>
              <p className="text-gray-600">
                Automatically match personnel to project requirements based on
                skills, role, and experience level.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call To Action */}
      <section className="py-16 bg-gray-100">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4 text-gray-800">
            Get Started Today
          </h2>
          <p className="text-gray-600 mb-8">
            Start organizing your team and delivering projects with confidence.
          </p>

          <Link
            to="/personnel"
            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Add Your First Team Member
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
