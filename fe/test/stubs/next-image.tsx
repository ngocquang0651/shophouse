/* eslint-disable @next/next/no-img-element */
import type { ImgHTMLAttributes } from "react";

type StubImageProps = Omit<ImgHTMLAttributes<HTMLImageElement>, "src"> & { src: string; fill?: boolean; sizes?: string };

/** Stands in for next/image, which needs the Next runtime, so component tests can render product images. */
export default function Image({ alt, src, className }: StubImageProps) {
  return <img alt={alt} src={src} className={className} />;
}
