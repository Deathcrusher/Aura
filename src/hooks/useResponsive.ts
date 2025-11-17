import { useState, useEffect } from 'react';

type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

interface BreakpointValues {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  '2xl': number;
}

const breakpoints: BreakpointValues = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
};

export const useResponsive = () => {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const currentBreakpoint = ((): Breakpoint => {
    const { width } = windowSize;
    if (width >= breakpoints['2xl']) return '2xl';
    if (width >= breakpoints.xl) return 'xl';
    if (width >= breakpoints.lg) return 'lg';
    if (width >= breakpoints.md) return 'md';
    if (width >= breakpoints.sm) return 'sm';
    return 'xs';
  })();

  const isMobile = currentBreakpoint === 'xs' || currentBreakpoint === 'sm';
  const isTablet = currentBreakpoint === 'md' || currentBreakpoint === 'lg';
  const isDesktop = currentBreakpoint === 'xl' || currentBreakpoint === '2xl';

  const isAbove = (breakpoint: Breakpoint): boolean => {
    return windowSize.width >= breakpoints[breakpoint];
  };

  const isBelow = (breakpoint: Breakpoint): boolean => {
    return windowSize.width < breakpoints[breakpoint];
  };

  const isBetween = (min: Breakpoint, max: Breakpoint): boolean => {
    return windowSize.width >= breakpoints[min] && windowSize.width < breakpoints[max];
  };

  return {
    windowSize,
    currentBreakpoint,
    isMobile,
    isTablet,
    isDesktop,
    isAbove,
    isBelow,
    isBetween,
    breakpoints,
  };
};

// Hook for responsive values
export const useResponsiveValue = <T>(
  values: Partial<Record<Breakpoint, T>>,
  defaultValue: T
): T => {
  const { currentBreakpoint, isAbove } = useResponsive();

  // Find the highest matching breakpoint value
  const breakpointOrder: Breakpoint[] = ['2xl', 'xl', 'lg', 'md', 'sm', 'xs'];
  
  for (const bp of breakpointOrder) {
    if (isAbove(bp) && values[bp] !== undefined) {
      return values[bp]!;
    }
  }

  return defaultValue;
};

// Hook for responsive styles
export const useResponsiveClass = (
  classes: Partial<Record<Breakpoint, string>>,
  defaultClass: string = ''
): string => {
  return useResponsiveValue(classes, defaultClass);
};

// Hook for device orientation
export const useOrientation = () => {
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>(
    typeof window !== 'undefined' 
      ? window.innerHeight > window.innerWidth ? 'portrait' : 'landscape'
      : 'portrait'
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOrientationChange = () => {
      setOrientation(
        window.innerHeight > window.innerWidth ? 'portrait' : 'landscape'
      );
    };

    window.addEventListener('resize', handleOrientationChange);
    window.addEventListener('orientationchange', handleOrientationChange);
    
    return () => {
      window.removeEventListener('resize', handleOrientationChange);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, []);

  return {
    orientation,
    isPortrait: orientation === 'portrait',
    isLandscape: orientation === 'landscape',
  };
};

// Hook for touch detection
export const useTouch = () => {
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const checkTouch = () => {
      setIsTouch(
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        (navigator as any).msMaxTouchPoints > 0
      );
    };

    checkTouch();
    
    // Also check on resize in case of device switch
    window.addEventListener('resize', checkTouch);
    return () => window.removeEventListener('resize', checkTouch);
  }, []);

  return {
    isTouch,
    isMouse: !isTouch,
  };
};

// Hook for device pixel ratio
export const useDevicePixelRatio = () => {
  const [pixelRatio, setPixelRatio] = useState(1);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const updatePixelRatio = () => {
      setPixelRatio(window.devicePixelRatio || 1);
    };

    updatePixelRatio();
    
    // Listen for pixel ratio changes (useful for zoom)
    const mediaQuery = window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`);
    mediaQuery.addEventListener('change', updatePixelRatio);
    
    return () => {
      mediaQuery.removeEventListener('change', updatePixelRatio);
    };
  }, []);

  return {
    pixelRatio,
    isRetina: pixelRatio > 1,
    isHighDensity: pixelRatio > 1.5,
  };
};

// Combined device info hook
export const useDeviceInfo = () => {
  const responsive = useResponsive();
  const orientation = useOrientation();
  const touch = useTouch();
  const pixelRatio = useDevicePixelRatio();

  return {
    ...responsive,
    ...orientation,
    ...touch,
    ...pixelRatio,
    // Convenience combinations
    isMobilePortrait: responsive.isMobile && orientation.isPortrait,
    isMobileLandscape: responsive.isMobile && orientation.isLandscape,
    isTabletPortrait: responsive.isTablet && orientation.isPortrait,
    isTabletLandscape: responsive.isTablet && orientation.isLandscape,
    // Device type detection
    isPhone: responsive.isMobile && touch.isTouch,
    isTabletDevice: responsive.isTablet && touch.isTouch,
    isDesktopDevice: responsive.isDesktop && !touch.isTouch,
  };
};
