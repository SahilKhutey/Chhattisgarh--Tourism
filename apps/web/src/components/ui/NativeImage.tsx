"use client";
import React, { ImgHTMLAttributes, useState, useEffect } from 'react';

interface NativeImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  fill?: boolean;
  priority?: boolean;
  src: string;
  alt: string;
  fallbackSrc?: string;
}

const DEFAULT_FALLBACK = "https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Chitrakot_waterfalls.JPG/1280px-Chitrakot_waterfalls.JPG";

export default function NativeImage({ 
  fill, 
  priority, 
  src, 
  alt, 
  className = '', 
  style,
  fallbackSrc = DEFAULT_FALLBACK,
  ...props 
}: NativeImageProps) {
  const getProxyUrl = (url: string) => {
    if (!url) return url;
    if (url.startsWith('http')) {
      return `/api/image-proxy?url=${encodeURIComponent(url)}`;
    }
    return url;
  };

  const resolvedUrl = getProxyUrl(src || fallbackSrc);
  const [imgSrc, setImgSrc] = useState(resolvedUrl);
  const [prevResolvedUrl, setPrevResolvedUrl] = useState(resolvedUrl);

  if (prevResolvedUrl !== resolvedUrl) {
    setPrevResolvedUrl(resolvedUrl);
    setImgSrc(resolvedUrl);
  }

  const combinedClassName = fill 
    ? `absolute inset-0 w-full h-full object-cover ${className}`
    : `max-w-full h-auto object-cover ${className}`;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={imgSrc}
      alt={alt || "Image"}
      className={combinedClassName}
      style={style}
      loading={priority ? 'eager' : 'lazy'}
      referrerPolicy="no-referrer"
      onError={() => {
        if (imgSrc !== getProxyUrl(fallbackSrc)) {
          setImgSrc(getProxyUrl(fallbackSrc));
        }
      }}
      {...props}
    />
  );
}
