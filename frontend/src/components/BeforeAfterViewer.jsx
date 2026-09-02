/**
 * BeforeAfterViewer — side-by-side display for change detection (flood/land-use shift).
 *
 * Day 1: stub with two placeholder image slots.
 * Day 5: wired to before/after image upload + change overlay.
 */
export default function BeforeAfterViewer({ beforeSrc, afterSrc }) {
  const placeholder = (label) => (
    <div className="flex h-48 flex-1 items-center justify-center rounded-lg bg-gray-100 text-sm text-gray-400">
      {label}
    </div>
  );

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-gray-700">
        Change Detection (Before / After)
      </h3>
      <div className="flex gap-2">
        {beforeSrc ? (
          <img
            src={beforeSrc}
            alt="Before"
            className="h-48 flex-1 rounded-lg border border-gray-200 object-cover"
          />
        ) : (
          placeholder("Before image")
        )}
        {afterSrc ? (
          <img
            src={afterSrc}
            alt="After"
            className="h-48 flex-1 rounded-lg border border-gray-200 object-cover"
          />
        ) : (
          placeholder("After image")
        )}
      </div>
    </div>
  );
}
