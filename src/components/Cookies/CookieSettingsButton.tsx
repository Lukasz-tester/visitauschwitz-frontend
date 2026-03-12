'use client'

export function CookieSettingsButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new CustomEvent('cookie-settings-open'))}
      className="text-white/80 font-semibold hover:text-amber-700 ease-in-out duration-500 cursor-pointer"
    >
      {label}
    </button>
  )
}
