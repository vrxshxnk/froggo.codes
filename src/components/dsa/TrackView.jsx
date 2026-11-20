"use client";

import { useEffect } from "react";
import { trackEvent } from "@/libs/analytics";

export default function TrackView({ event, params }) {
  useEffect(() => {
    trackEvent(event, params);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}
