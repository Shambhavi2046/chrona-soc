"use client";

import { useState, useEffect } from "react";

interface ClientDateProps {
  date: string | Date;
  format?: 'date' | 'time' | 'full';
  className?: string;
}

export default function ClientDate({ date, format = 'full', className = "" }: ClientDateProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Ensure date is a Date object
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  // Server-side / Initial render: Use a deterministic UTC format to guarantee hydration match
  if (!mounted) {
    const fallback = dateObj.toISOString().split('T')[0] + " (UTC)";
    return <span className={className}>{fallback}</span>;
  }

  // Client-side render: Safe to use browser locale
  let formatted = "";
  if (format === 'date') {
    formatted = dateObj.toLocaleDateString();
  } else if (format === 'time') {
    formatted = dateObj.toLocaleTimeString();
  } else {
    formatted = dateObj.toLocaleString();
  }

  return <span className={className}>{formatted}</span>;
}
