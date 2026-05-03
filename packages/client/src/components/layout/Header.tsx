/**
 * Header — top navigation bar.
 */

export const Header = (): React.JSX.Element => {
  return (
    <header className="bg-bee-yellow shadow-sm">
      <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
        <h1 className="text-xl font-bold text-bee-brown">Spelling Bee</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-bee-brown/70">Daily Puzzle</span>
        </div>
      </div>
    </header>
  );
};
