import React from 'react';

interface CurrencyProps {
  paise: number;
  className?: string;
}

export function FormattedCurrency({ paise, className = '' }: CurrencyProps) {
  const rupees = paise / 100;
  const formatted = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(rupees);

  return <span className={className}>{formatted}</span>;
}

interface DateProps {
  dateString: string | Date;
  className?: string;
  includeTime?: boolean;
}

export function FormattedDate({ dateString, className = '', includeTime = false }: DateProps) {
  const date = new Date(dateString);

  if (isNaN(date.getTime())) {
    return <span className={className}>Invalid Date</span>;
  }

  // Format as DD-MMM-YYYY (e.g. 27-Jul-2026)
  const options: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  };

  if (includeTime) {
    options.hour = '2-digit';
    options.minute = '2-digit';
    options.hour12 = true;
  }

  // Format using standard locale config
  const parts = new Intl.DateTimeFormat('en-GB', options).format(date);
  // Re-format to replace spaces with hyphens for DD-MMM-YYYY style if desired, or keep as space separated
  // We'll replace spaces with hyphens: "27 Jul 2026" -> "27-Jul-2026"
  const formatted = parts.replace(/ /g, '-').replace(/-at-/, ' ');

  return <span className={`font-mono ${className}`}>{formatted}</span>;
}
