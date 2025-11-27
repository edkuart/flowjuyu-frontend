"use client";

import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { cn } from "@/lib/utils";

export interface SliderProps
  extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {}

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  SliderProps
>(({ className, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex w-full touch-none select-none items-center",
      className
    )}
    {...props}
  >
    <SliderPrimitive.Track className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-neutral-200">
      <SliderPrimitive.Range className="absolute h-full bg-primary" />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb className="block h-4 w-4 rounded-full border border-primary bg-white shadow focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2" />
    <SliderPrimitive.Thumb className="block h-4 w-4 rounded-full border border-primary bg-white shadow focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2" />
  </SliderPrimitive.Root>
));

Slider.displayName = "Slider";

export { Slider };
