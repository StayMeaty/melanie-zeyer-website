import React from 'react';

interface LogoProps {
  src?: string;
  alt?: string;
  size?: number;
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ 
  src = '/assets/logo.svg', 
  alt = 'Logo', 
  size = 120,
  className = '' 
}) => {
  const logoStyle: React.CSSProperties = {
    width: `${size}px`,
    height: `${size}px`,
    objectFit: 'contain',
  };

  const handleError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.target as HTMLImageElement;
    target.style.display = 'none';
  };

  return (
    <img
      src={src}
      alt={alt}
      style={logoStyle}
      className={className}
      onError={handleError}
    />
  );
};

export default Logo;