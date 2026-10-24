type ImagePlaceholderProps = {
  label: string;
  /** Suggested filename to drop in /public/images/ */
  slot: string;
  className?: string;
  aspect?: "square" | "video" | "circle" | "portrait";
};

const aspectClass = {
  square: "aspect-square",
  video: "aspect-video",
  circle: "aspect-square rounded-full",
  portrait: "aspect-[3/4]",
} as const;

/**
 * Espacio reservado para imágenes.
 * Coloca el archivo en: public/images/{slot}.jpg (o .png / .webp)
 */
export function ImagePlaceholder({
  label,
  slot,
  className = "",
  aspect = "square",
}: ImagePlaceholderProps) {
  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden border border-dashed border-coral/40 bg-chocolate/60 ${aspectClass[aspect]} ${className}`}
      data-image-slot={slot}
      aria-label={`Espacio para imagen: ${label}`}
    >
      <div className="px-3 text-center">
        {label ? (
          <p className="font-display text-sm tracking-widest text-amarillo uppercase">
            {label}
          </p>
        ) : null}
        <p className="mt-1 font-sans text-[10px] break-all text-cream/50 sm:text-xs">
          /images/{slot}
        </p>
      </div>
    </div>
  );
}
