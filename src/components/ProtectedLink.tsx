import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedLinkProps {
  to: string;
  children: React.ReactNode;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

/**
 * A simplified Link component that checks authentication state
 * and either navigates or redirects to login
 */
export const ProtectedLink: React.FC<ProtectedLinkProps> = ({ 
  to, 
  children, 
  className = '',
  onClick,
  ...props 
}) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Let the default Link behavior work if already authenticated
    if (isAuthenticated) {
      if (onClick) onClick(e);
      return;
    }
    
    // Prevent default navigation if not authenticated
    e.preventDefault();
    if (onClick) onClick(e);
    
    // Redirect to login with returnTo parameter
    navigate(`/login?returnTo=${encodeURIComponent(to)}`);
  };

  return (
    <Link 
      to={to} 
      className={className} 
      onClick={handleClick}
      {...props}
    >
      {children}
    </Link>
  );
};

export default ProtectedLink;
