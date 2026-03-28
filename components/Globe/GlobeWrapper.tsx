"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";
import { forwardRef } from "react";
import type { GlobeViewHandle } from "./GlobeView";
import type { GlobePoint } from "@/lib/types";

interface GlobeWrapperProps {
  points?: GlobePoint[];
  onPointClick?: (point: GlobePoint) => void;
  onPointHover?: (point: GlobePoint | null) => void;
  className?: string;
}

const GlobeViewDynamic = dynamic(
  () => import("./GlobeView").then((m) => m.GlobeView),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-[#08090c]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-[#00d4ff] animate-spin" />
          <p className="text-xs text-[#475569]">Loading globe...</p>
        </div>
      </div>
    ),
  }
);

export const GlobeWrapper = forwardRef<GlobeViewHandle, GlobeWrapperProps>(
  (props, ref) => <GlobeViewDynamic {...props} ref={ref} />
);

GlobeWrapper.displayName = "GlobeWrapper";
