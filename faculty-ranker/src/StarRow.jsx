export default function StarRow({ rating, onRate, isInteractive }) {
  const rounded = Math.round(rating);
  const handler = (v) => {
    if (!onRate) return;
    onRate(v);
  };
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          onClick={onRate ? () => handler(s) : undefined}
          className={isInteractive && onRate ? "cursor-pointer" : "cursor-default"}
        >
          <span className={s <= rounded ? "text-yellow-400 text-lg" : "text-gray-600 text-lg"}>
            ★
          </span>
        </button>
      ))}
      <span className="ml-1 text-xs text-gray-300">{rating.toFixed(1)}</span>
    </div>
  );
}