'use client'

export default function Button({ 
  children, 
  variant = "primary", 
  size = "md", 
  className = "", 
  onClick,
  disabled = false,
  type = "button",
  fullWidth = false
}) {
  // Base styles
  const baseStyles = "inline-flex items-center justify-center font-medium transition-all duration-200 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  
  // Variant styles
  const variants = {
    primary: "bg-accent text-white hover:bg-opacity-90 focus:ring-accent",
    secondary: "bg-primary text-white hover:bg-opacity-90 focus:ring-primary",
    outline: "border-2 border-accent text-accent hover:bg-accent hover:text-white focus:ring-accent",
    outlineLight: "border-2 border-white text-white hover:bg-white hover:text-primary focus:ring-white",
    ghost: "text-secondary hover:text-accent hover:bg-gray-50 focus:ring-accent",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-600",
    success: "bg-green-600 text-white hover:bg-green-700 focus:ring-green-600",
  };
  
  // Size styles
  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
    xl: "px-8 py-4 text-xl",
  };
  
  // Width styles
  const width = fullWidth ? "w-full" : "";
  
  return (
    <button
      type={type}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${width} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

// Icon Button Component
Button.Icon = function IconButton({ 
  children, 
  icon: Icon, 
  iconPosition = "left", 
  variant = "primary", 
  size = "md",
  className = "",
  onClick 
}) {
  return (
    <Button variant={variant} size={size} onClick={onClick} className={className}>
      {iconPosition === "left" && Icon && <Icon className="w-4 h-4 mr-2" />}
      {children}
      {iconPosition === "right" && Icon && <Icon className="w-4 h-4 ml-2" />}
    </Button>
  );
};