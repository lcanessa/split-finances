export function Input({ label, id, className = '', ...props }) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-slate-700">
          {label}
        </label>
      )}
      <input
        id={id}
        className={`sheet-input w-full rounded-lg border border-slate-200 px-3 py-2 text-base text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 md:text-sm ${className}`}
        {...props}
      />
    </div>
  )
}
