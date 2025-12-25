export default function Button({ children, onClick, type="button" }) {
  return (
    <button
      type={type}
      onClick={onClick}
      className="bg-primary hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
    >
      {children}
    </button>
  );
}
