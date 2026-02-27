export function Header() {
  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-3">
        <svg
          className="w-8 h-8 flex-shrink-0"
          viewBox="0 0 100 100"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect
            x="10"
            y="10"
            width="80"
            height="80"
            fill="none"
            stroke="#2563eb"
            strokeWidth="3"
          />
          <line
            x1="10"
            y1="10"
            x2="90"
            y2="90"
            stroke="#f59e0b"
            strokeWidth="2"
            strokeDasharray="4,3"
          />
          <line
            x1="50"
            y1="10"
            x2="50"
            y2="90"
            stroke="#10b981"
            strokeWidth="2"
            strokeDasharray="4,3"
          />
          <circle cx="50" cy="50" r="4" fill="#ef4444" />
        </svg>
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            Origami Reference Finder
          </h1>
          <p className="text-sm text-gray-500">
            Find minimal fold sequences to locate reference points &amp; lines
          </p>
        </div>
      </div>
    </header>
  );
}
