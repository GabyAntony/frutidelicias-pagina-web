import Image from "next/image";
import { productImage } from "@/lib/menu";

type ProductVisualProps = {
  slot: string;
  alt: string;
  className?: string;
  imageClassName?: string;
  sizes?: string;
  priority?: boolean;
  overlay?: boolean;
  interactive?: boolean;
};

export function ProductVisual({
  slot,
  alt,
  className = "",
  imageClassName = "",
  sizes = "(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw",
  priority = false,
  overlay = true,
  interactive = true,
}: ProductVisualProps) {
  const image = productImage(slot);

  if (!image) {
    return (
      <div
        className={`relative flex items-center justify-center overflow-hidden bg-gradient-to-br from-rojo to-chocolate ${className}`}
        aria-label={alt}
      >
        <span className="text-5xl" aria-hidden>
          🍓
        </span>
      </div>
    );
  }

  return (
    <div
      className={`relative overflow-hidden bg-chocolate ${className}`}
      data-cursor={interactive ? "taste" : undefined}
      data-cursor-label={interactive ? "¡Probar!" : undefined}
    >
      <Image
        src={image}
        alt={alt}
        fill
        placeholder="blur"
        sizes={sizes}
        priority={priority}
        className={`image-warm object-cover transition-transform duration-[900ms] ease-out ${imageClassName}`}
      />
      {overlay ? (
        <>
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-chocolate via-chocolate/10 to-chocolate/30" />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-chocolate/35 via-transparent to-chocolate/20" />
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(circle at 50% 34%, transparent 30%, rgba(76,30,13,0.42) 100%)",
            }}
          />
        </>
      ) : null}
    </div>
  );
}
