'use client'

export default function Card({ children, className = "", onClick }) {
  return (
    <div 
      className={`bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

// Card Header Component
Card.Header = function CardHeader({ children, className = "" }) {
  return (
    <div className={`p-5 md:p-6 border-b border-gray-100 ${className}`}>
      {children}
    </div>
  );
};

// Card Body Component
Card.Body = function CardBody({ children, className = "" }) {
  return (
    <div className={`p-5 md:p-6 ${className}`}>
      {children}
    </div>
  );
};

// Card Footer Component
Card.Footer = function CardFooter({ children, className = "" }) {
  return (
    <div className={`p-5 md:p-6 bg-gray-50 border-t border-gray-100 ${className}`}>
      {children}
    </div>
  );
};

// Card Title Component
Card.Title = function CardTitle({ children, className = "" }) {
  return (
    <h3 className={`text-lg md:text-xl font-bold text-primary mb-2 ${className}`}>
      {children}
    </h3>
  );
};

// Card Description Component
Card.Description = function CardDescription({ children, className = "" }) {
  return (
    <p className={`text-secondary text-sm leading-relaxed ${className}`}>
      {children}
    </p>
  );
};