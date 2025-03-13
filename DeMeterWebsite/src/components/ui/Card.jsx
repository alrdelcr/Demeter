// Updated Card component (src/components/ui/card.jsx)
import React from "react";

export const Card = ({ children, className = "" }) => (
  // Removed bg-white to allow custom backgrounds
  <div className={`border rounded-lg shadow-md p-4 ${className}`}>
    {children}
  </div>
);

export const CardContent = ({ children, className = "" }) => (
  <div className={`p-4 ${className}`}>{children}</div>
);
