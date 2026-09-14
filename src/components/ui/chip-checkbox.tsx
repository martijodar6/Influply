// Uncontrolled checkbox styled as a chip — works with plain <form action=...>
// FormData (formData.getAll(name)) without any client state.
export function ChipCheckbox({ name, value, label, defaultChecked }: { name: string; value: string; label?: string; defaultChecked?: boolean }) {
  return (
    <label className="group cursor-pointer">
      <input type="checkbox" name={name} value={value} defaultChecked={defaultChecked} className="peer sr-only" />
      <span className="inline-flex items-center rounded-full border border-ink-100 bg-white px-3.5 py-1.5 text-sm font-medium text-ink-700 transition peer-checked:border-brand-500 peer-checked:bg-brand-500 peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-brand-200">
        {label ?? value}
      </span>
    </label>
  );
}

export function RadioChip({ name, value, label, defaultChecked }: { name: string; value: string; label?: string; defaultChecked?: boolean }) {
  return (
    <label className="group cursor-pointer">
      <input type="radio" name={name} value={value} defaultChecked={defaultChecked} className="peer sr-only" />
      <span className="inline-flex items-center rounded-full border border-ink-100 bg-white px-3.5 py-1.5 text-sm font-medium text-ink-700 transition peer-checked:border-brand-500 peer-checked:bg-brand-500 peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-brand-200">
        {label ?? value}
      </span>
    </label>
  );
}
