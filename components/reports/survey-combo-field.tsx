'use client';

import { useId, useMemo, useRef, useState } from 'react';

const inputClassNameBase =
  "w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-base text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-1 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:placeholder:text-neutral-500 sm:text-sm";

type Props = {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  name?: string;
  suggestions: readonly string[];
  placeholder?: string;
  helperText?: string;
  /** Show quick-pick chips (default: first 10 suggestions). */
  chipCount?: number;
  multiline?: boolean;
  rows?: number;
  /** Accent for focus ring and selected chips (library KYC uses emerald). */
  variant?: "blue" | "emerald";
};

function filterSuggestions(suggestions: readonly string[], query: string): string[] {
  const q = query.trim().toLowerCase();
  if (!q) return [...suggestions];
  return suggestions.filter((s) => s.toLowerCase().includes(q));
}

const inputVariants = {
  blue:
    "focus:border-blue-500 focus:ring-blue-500 dark:focus:border-blue-400 dark:focus:ring-blue-400",
  emerald:
    "focus:border-emerald-500 focus:ring-emerald-500 dark:focus:border-emerald-400 dark:focus:ring-emerald-400",
} as const;

const chipVariants = {
  blue: {
    selected:
      "border-blue-600 bg-blue-600 text-white dark:border-blue-500 dark:bg-blue-500",
    idle:
      "border-neutral-300 bg-neutral-50 text-neutral-700 hover:border-blue-400 hover:text-blue-700 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:border-blue-400 dark:hover:text-blue-300",
    dropdownHover:
      "hover:bg-blue-50 dark:hover:bg-neutral-800",
  },
  emerald: {
    selected:
      "border-emerald-600 bg-emerald-600 text-white dark:border-emerald-500 dark:bg-emerald-500",
    idle:
      "border-neutral-300 bg-neutral-50 text-neutral-700 hover:border-emerald-400 hover:text-emerald-800 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:border-emerald-400 dark:hover:text-emerald-300",
    dropdownHover:
      "hover:bg-emerald-50 dark:hover:bg-neutral-800",
  },
} as const;

export function SurveyComboField({
  value,
  onChange,
  onBlur,
  name,
  suggestions,
  placeholder,
  helperText = "Pick a suggestion or type your own.",
  chipCount = 10,
  multiline = false,
  rows = 3,
  variant = "blue",
}: Props) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const inputAccent = inputVariants[variant];
  const chipAccent = chipVariants[variant];
  const inputClassName = `${inputClassNameBase} ${inputAccent}`;

  const chips = suggestions.slice(0, chipCount);
  const filtered = useMemo(
    () => filterSuggestions(suggestions, value).slice(0, 8),
    [suggestions, value],
  );

  function selectSuggestion(suggestion: string) {
    onChange(suggestion);
    setOpen(false);
  }

  function handleBlur() {
    window.setTimeout(() => {
      setOpen(false);
      onBlur?.();
    }, 120);
  }

  const showDropdown =
    open && filtered.length > 0 && filtered.some((s) => s !== value);

  const dropdown = showDropdown ? (
    <ul
      className="absolute z-20 mt-1 w-full overflow-hidden rounded-xl border border-neutral-200 bg-white py-1 shadow-lg dark:border-neutral-700 dark:bg-neutral-900"
      role="listbox"
    >
      {filtered.map((suggestion) => (
        <li key={suggestion}>
          <button
            type="button"
            className={`w-full px-4 py-2.5 text-left text-sm text-neutral-800 dark:text-neutral-100 ${chipAccent.dropdownHover}`}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => selectSuggestion(suggestion)}
          >
            {suggestion}
          </button>
        </li>
      ))}
    </ul>
  ) : null;

  return (
    <div ref={rootRef} className="mt-1 space-y-2">
      <div className="relative">
        {multiline ? (
          <textarea
            id={listId}
            name={name}
            value={value}
            rows={rows}
            placeholder={placeholder}
            className={inputClassName}
            onChange={(e) => {
              onChange(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onBlur={handleBlur}
          />
        ) : (
          <>
            <input
              id={listId}
              type="text"
              name={name}
              value={value}
              placeholder={placeholder}
              className={inputClassName}
              autoComplete="off"
              list={`${listId}-datalist`}
              onChange={(e) => {
                onChange(e.target.value);
                setOpen(true);
              }}
              onFocus={() => setOpen(true)}
              onBlur={handleBlur}
            />
            <datalist id={`${listId}-datalist`}>
              {suggestions.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
          </>
        )}

        {dropdown}
      </div>

      {chips.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {chips.map((chip) => {
            const selected = value.trim() === chip;
            return (
              <button
                key={chip}
                type="button"
                onClick={() => selectSuggestion(chip)}
                className={`min-h-10 rounded-full border px-3 py-2 text-xs font-medium transition-colors sm:min-h-0 sm:py-1 ${
                  selected ? chipAccent.selected : chipAccent.idle
                }`}
              >
                {chip}
              </button>
            );
          })}
        </div>
      )}

      {helperText && (
        <p className="text-xs text-neutral-500 dark:text-neutral-400">{helperText}</p>
      )}
    </div>
  );
}
