import type { ReactNode } from "react";

type SectionHeadingProps = {
  eyebrow: string;
  title: ReactNode;
  description?: ReactNode;
  tone?: "light" | "dark";
  align?: "left" | "center";
  className?: string;
  titleClassName?: string;
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  tone = "light",
  align = "left",
  className = "",
  titleClassName = "",
}: SectionHeadingProps) {
  const isLight = tone === "light";

  return (
    <div
      className={`${align === "center" ? "mx-auto text-center" : ""} max-w-2xl ${className}`}
    >
      <p
        className={`eyebrow ${isLight ? "text-amarillo" : "text-rojo"} ${
          align === "center" ? "justify-center" : ""
        }`}
      >
        {eyebrow}
      </p>
      <h2
        className={`mt-4 font-display text-4xl uppercase leading-[0.92] tracking-wide sm:text-5xl lg:text-6xl ${
          isLight ? "text-cream" : "text-chocolate"
        } ${titleClassName}`}
      >
        {title}
      </h2>
      {description ? (
        <p
          className={`mt-4 font-sans text-sm leading-relaxed sm:text-base ${
            isLight ? "text-cream/70" : "text-chocolate/70"
          }`}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}
