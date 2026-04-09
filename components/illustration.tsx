// components/Illustration.tsx
type IllustrationProps = {
  src: string
  alt?: string
  className?: string
}

export default function Illustration({ src, alt, className }: IllustrationProps) {
  return (
    <img
      src={src}
      alt={alt || "illustration"}
      className={`w-full h-auto object-contain select-none pointer-events-none ${className}`}
      draggable={false}
    />
  )
}