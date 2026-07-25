export default function Input({ label, icon: Icon, className = "", wrapperClassName = "", ...props }) {
  return (
    <label className={`block ${wrapperClassName}`}>
      {label && <span className="mb-1.5 block text-sm font-medium text-slate-700">{label}</span>}
      <div className="relative">
        {Icon && (
          <Icon size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        )}
        <input
          className={`w-full rounded-lg border border-slate-300 bg-white py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${
            Icon ? "pl-9 pr-3" : "px-3"
          } ${className}`}
          {...props}
        />
      </div>
    </label>
  );
}
