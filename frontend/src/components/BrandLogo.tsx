"use client";

type BrandLogoProps = {
  className?: string;
  alt?: string;
};

export function BrandLogo({ className = "h-10 w-auto", alt = "StudyPoint" }: BrandLogoProps) {
  return (
    <img src="/logo.png" alt={alt} className={`object-contain ${className}`} draggable={false} />
  );
}
