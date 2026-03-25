"use client";

import type { ComponentProps } from "react";
import { Toaster as Sonner } from "sonner";

type ToasterProps = ComponentProps<typeof Sonner>;

function Toaster({ ...props }: ToasterProps) {
  return (
    <Sonner
      theme="light"
      duration={5000}
      closeButton
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "!bg-card text-card-foreground !text-foreground !border !border-border !shadow-lg !opacity-100 backdrop-blur-0",
          title: "!text-foreground",
          description: "!text-muted-foreground",
          success: "!bg-card text-card-foreground !border-green-600",
          error: "!bg-card text-card-foreground !border-red-600",
          closeButton: "!bg-muted/50 !text-foreground !border !border-border",
        },
      }}
      {...props}
    />
  );
}

export { Toaster };
