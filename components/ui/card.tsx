import React from "react";

export function Card({
  children,
  className = "",
}: any) {
  return (
    <div className={`rounded-lg border p-4 ${className}`}>
      {children}
    </div>
  );
}

export function CardHeader({
  children,
  className = "",
}: any) {
  return (
    <div className={className}>
      {children}
    </div>
  );
}

export function CardTitle({
  children,
  className = "",
}: any) {
  return (
    <h2 className={`font-bold text-xl ${className}`}>
      {children}
    </h2>
  );
}

export function CardContent({
  children,
  className = "",
}: any) {
  return (
    <div className={className}>
      {children}
    </div>
  );
}