import React, { useState } from 'react';

interface ImageWithFallbackProps {
  src: string | null;
  alt: string;
  className?: string;
  fallbackSrc?: string;
}

/**
 * Image component with proper fallback handling to prevent flickering
 */
const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  alt,
  className = '',
  fallbackSrc = '/placeholder-poster.svg'
}) => {
  const [imageSrc, setImageSrc] = useState<string>(src || fallbackSrc || '');
  const [hasError, setHasError] = useState<boolean>(false);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      setImageSrc(fallbackSrc);
    }
  };

  // Update image source when src prop changes
  React.useEffect(() => {
    if (src) {
      setImageSrc(src);
      setHasError(false);
    } else {
      setImageSrc(fallbackSrc || '');
      setHasError(true);
    }
  }, [src, fallbackSrc]);

  return (
    <img
      src={imageSrc}
      alt={alt}
      className={className}
      onError={handleError}
    />
  );
};

export default ImageWithFallback;


