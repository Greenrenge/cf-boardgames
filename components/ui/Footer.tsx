export function Footer() {
  return (
    <footer className="w-full py-6 px-4 border-t border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto text-center">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          <a
            target="_blank"
            href="https://hwint.ru/portfolio-item/spyfall/"
            rel="noreferrer"
            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline transition-colors"
          >
            Spyfall
          </a>
          {' is designed by Alexandr Ushan and published by '}
          <a
            target="_blank"
            href="http://international.hobbyworld.ru/"
            rel="noreferrer"
            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline transition-colors"
          >
            Hobby World
          </a>
        </div>
      </div>
    </footer>
  );
}
