'use client'

export default function Container({ 
  children, 
  size = "default", 
  className = "",
  as: Component = "div"
}) {
  // Size variants
  const sizes = {
    sm: "max-w-4xl",
    default: "max-w-7xl",
    lg: "max-w-[90rem]",
    xl: "max-w-[120rem]",
    full: "max-w-full",
  };
  
  // Base container styles
  const baseStyles = `mx-auto px-4 sm:px-6 lg:px-8 ${sizes[size]}`;
  
  return (
    <Component className={`${baseStyles} ${className}`}>
      {children}
    </Component>
  );
}

// Fluid Container (full width with padding)
Container.Fluid = function FluidContainer({ children, className = "" }) {
  return (
    <div className={`w-full px-4 sm:px-6 lg:px-8 ${className}`}>
      {children}
    </div>
  );
};

// Section Container (with spacing)
Container.Section = function SectionContainer({ 
  children, 
  className = "",
  background = "white",
  spacing = "default"
}) {
  const backgrounds = {
    white: "bg-white",
    light: "bg-light",
    primary: "bg-primary",
    accent: "bg-accent",
  };
  
  const spacings = {
    sm: "py-8 md:py-12",
    default: "py-12 md:py-20",
    lg: "py-16 md:py-28",
    xl: "py-20 md:py-32",
  };
  
  return (
    <section className={`${backgrounds[background]} ${spacings[spacing]} ${className}`}>
      <Container>
        {children}
      </Container>
    </section>
  );
};

// Grid Container
Container.Grid = function GridContainer({ 
  children, 
  cols = 1,
  mdCols = 2,
  lgCols = 4,
  gap = "default",
  className = ""
}) {
  const gaps = {
    sm: "gap-4",
    default: "gap-6",
    lg: "gap-8",
    xl: "gap-12",
  };
  
  return (
    <div className={`grid grid-cols-${cols} md:grid-cols-${mdCols} lg:grid-cols-${lgCols} ${gaps[gap]} ${className}`}>
      {children}
    </div>
  );
};