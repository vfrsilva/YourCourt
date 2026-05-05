type Props = {
  count: number | null;
  status: "locating" | "ready" | "error";
  errorMessage?: string | null;
};

export function Header({ count, status, errorMessage }: Props) {
  let right: string;
  if (status === "locating") {
    right = "Locating...";
  } else if (status === "error") {
    right = errorMessage ?? "Something went wrong";
  } else if (count === null) {
    right = "Loading courts...";
  } else {
    right = `${count} court${count === 1 ? "" : "s"} in view`;
  }

  return (
    <header
      role="banner"
      className="absolute inset-x-0 top-0 z-[1000] flex items-center justify-between gap-4 bg-white/80 px-4 py-3 backdrop-blur-md"
    >
      <h1 className="text-lg font-semibold tracking-tight text-gray-900">
        YourCourt
      </h1>
      <span
        className="text-sm font-medium text-gray-700"
        aria-live="polite"
      >
        {right}
      </span>
    </header>
  );
}
