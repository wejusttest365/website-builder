const inputCls =
  "h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 shadow-sm outline-none transition-all focus:border-violet-500 focus:ring-2 focus:ring-violet-100";

type Props = {
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  placeholder?: string;
};

export function PropertyText({
  value,
  onChange,
  onBlur,
  placeholder,
}: Props) {
  return (
    <input
      className={inputCls}
      value={value}
      placeholder={placeholder ?? ""}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onBlur}
    />
  );
}