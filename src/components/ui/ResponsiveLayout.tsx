import React, { ReactNode } from 'react';
import { useDeviceInfo } from '../../hooks/useResponsive';

interface ResponsiveLayoutProps {
  children: ReactNode;
  className?: string;
}

interface ContainerProps {
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  className?: string;
}

interface GridProps {
  children: ReactNode;
  cols?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
    '2xl'?: number;
  };
  gap?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
    '2xl'?: number;
  };
  className?: string;
}

interface FlexProps {
  children: ReactNode;
  direction?: {
    xs?: 'row' | 'col';
    sm?: 'row' | 'col';
    md?: 'row' | 'col';
    lg?: 'row' | 'col';
    xl?: 'row' | 'col';
    '2xl'?: 'row' | 'col';
  };
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';
  wrap?: boolean;
  gap?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
    '2xl'?: number;
  };
  className?: string;
}

// Responsive Container
export const Container: React.FC<ContainerProps> = ({ 
  children, 
  size = 'lg', 
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'max-w-2xl',
    md: 'max-w-4xl', 
    lg: 'max-w-6xl',
    xl: 'max-w-7xl',
    full: 'max-w-full'
  };

  return (
    <div className={`w-full mx-auto px-4 sm:px-6 lg:px-8 ${sizeClasses[size]} ${className}`}>
      {children}
    </div>
  );
};

// Responsive Grid
export const Grid: React.FC<GridProps> = ({ 
  children, 
  cols = { xs: 1, sm: 2, md: 3, lg: 4, xl: 5 }, 
  gap = { xs: 4, sm: 6, md: 8, lg: 10, xl: 12 },
  className = '' 
}) => {
  const { currentBreakpoint } = useDeviceInfo();
  
  // Get current column count
  const getCurrentCols = () => {
    const breakpointOrder = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'] as const;
    const reversedOrder = [...breakpointOrder].reverse();
    for (const bp of reversedOrder) {
      if (currentBreakpoint === bp || isAboveBreakpoint(currentBreakpoint, bp)) {
        return cols[bp] || cols.xs || 1;
      }
    }
    return cols.xs || 1;
  };

  // Get current gap
  const getCurrentGap = () => {
    const breakpointOrder = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'] as const;
    const reversedOrder = [...breakpointOrder].reverse();
    for (const bp of reversedOrder) {
      if (currentBreakpoint === bp || isAboveBreakpoint(currentBreakpoint, bp)) {
        return gap[bp] || gap.xs || 4;
      }
    }
    return gap.xs || 4;
  };

  const gridCols = getCurrentCols();
  const gridGap = getCurrentGap();

  return (
    <div 
      className={`grid gap-${gridGap} ${className}`}
      style={{
        gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))`
      }}
    >
      {children}
    </div>
  );
};

// Responsive Flex
export const Flex: React.FC<FlexProps> = ({ 
  children, 
  direction = { xs: 'col', sm: 'row' }, 
  justify = 'start', 
  align = 'start', 
  wrap = false,
  gap = { xs: 4, sm: 6, md: 8, lg: 10, xl: 12 },
  className = '' 
}) => {
  const { currentBreakpoint } = useDeviceInfo();
  
  // Get current direction
  const getCurrentDirection = () => {
    const breakpointOrder = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'] as const;
    const reversedOrder = [...breakpointOrder].reverse();
    for (const bp of reversedOrder) {
      if (currentBreakpoint === bp || isAboveBreakpoint(currentBreakpoint, bp)) {
        return direction[bp] || direction.xs || 'col';
      }
    }
    return direction.xs || 'col';
  };

  // Get current gap
  const getCurrentGap = () => {
    const breakpointOrder = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'] as const;
    const reversedOrder = [...breakpointOrder].reverse();
    for (const bp of reversedOrder) {
      if (currentBreakpoint === bp || isAboveBreakpoint(currentBreakpoint, bp)) {
        return gap[bp] || gap.xs || 4;
      }
    }
    return gap.xs || 4;
  };

  const flexDirection = getCurrentDirection();
  const flexGap = getCurrentGap();

  const justifyClasses = {
    start: 'justify-start',
    center: 'justify-center', 
    end: 'justify-end',
    between: 'justify-between',
    around: 'justify-around',
    evenly: 'justify-evenly'
  };

  const alignClasses = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end', 
    stretch: 'items-stretch',
    baseline: 'items-baseline'
  };

  return (
    <div 
      className={`flex ${flexDirection === 'row' ? 'flex-row' : 'flex-col'} ${justifyClasses[justify]} ${alignClasses[align]} ${wrap ? 'flex-wrap' : 'flex-nowrap'} gap-${flexGap} ${className}`}
    >
      {children}
    </div>
  );
};

// Responsive Layout Wrapper
export const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({ 
  children, 
  className = '' 
}) => {
  const { isMobile, isTablet, isDesktop } = useDeviceInfo();

  return (
    <div className={`w-full min-h-screen ${className}`}>
      {/* Mobile Layout */}
      {isMobile && (
        <div className="flex flex-col h-screen">
          <div className="flex-1 overflow-hidden">
            {children}
          </div>
        </div>
      )}

      {/* Tablet Layout */}
      {isTablet && (
        <div className="flex flex-col h-screen">
          <div className="flex-1 overflow-hidden">
            {children}
          </div>
        </div>
      )}

      {/* Desktop Layout */}
      {isDesktop && (
        <div className="flex flex-row h-screen">
          <div className="flex-1 overflow-hidden">
            {children}
          </div>
        </div>
      )}
    </div>
  );
};

// Responsive Section
export const Section: React.FC<{
  children: ReactNode;
  padding?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
    '2xl'?: number;
  };
  className?: string;
}> = ({ children, padding = { xs: 4, sm: 6, md: 8, lg: 10, xl: 12 }, className = '' }) => {
  const { currentBreakpoint } = useDeviceInfo();
  
  const getCurrentPadding = () => {
    const breakpointOrder = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'] as const;
    const reversedOrder = [...breakpointOrder].reverse();
    for (const bp of reversedOrder) {
      if (currentBreakpoint === bp || isAboveBreakpoint(currentBreakpoint, bp)) {
        return padding[bp] || padding.xs || 4;
      }
    }
    return padding.xs || 4;
  };

  const sectionPadding = getCurrentPadding();

  return (
    <section className={`py-${sectionPadding} ${className}`}>
      {children}
    </section>
  );
};

interface ResponsiveCardProps {
  children: ReactNode;
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
  onMouseDown?: (e: React.MouseEvent) => void;
}

// Responsive Card
export const ResponsiveCard: React.FC<ResponsiveCardProps> = ({ 
  children, 
  className = '',
  onClick,
  onMouseDown
}) => {
  const { isMobile, isTablet, isDesktop } = useDeviceInfo();

  const sizeClasses = {
    mobile: 'p-4 rounded-xl',
    tablet: 'p-6 rounded-2xl', 
    desktop: 'p-8 rounded-3xl'
  };

  const currentClasses = isMobile ? sizeClasses.mobile : 
                        isTablet ? sizeClasses.tablet : 
                        sizeClasses.desktop;

  return (
    <div 
      className={`glass ${currentClasses} ${className}`}
      onClick={onClick}
      onMouseDown={onMouseDown}
    >
      {children}
    </div>
  );
};

// Helper function
const isAboveBreakpoint = (current: string, target: string): boolean => {
  const order = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'];
  return order.indexOf(current) >= order.indexOf(target);
};

export default {
  Container,
  Grid,
  Flex,
  ResponsiveLayout,
  Section,
  ResponsiveCard
};
