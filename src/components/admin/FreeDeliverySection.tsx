"use client";

import { useState } from "react";

export default function FreeDeliverySection({
  defaultEnabled,
  defaultThreshold,
}: {
  defaultEnabled: boolean;
  defaultThreshold: number;
}) {
  const [enabled, setEnabled] = useState(defaultEnabled);

  return (
    <div className="space-y-4">
      <label className="flex items-center gap-2.5 text-sm text-husk">
        <input
          type="checkbox"
          name="free_delivery_enabled"
          checked={enabled}
          onChange={(e) => setEnabled(e.target.checked)}
          className="h-4 w-4 accent-paddy-800"
        />
        Enable free delivery above a spend threshold
      </label>

      {enabled && (
        <label className="block pl-6">
          <span className="mb-1.5 block text-sm font-medium text-husk">
            Free delivery over (LKR)
          </span>
          <input
            name="free_delivery_threshold"
            type="number"
            min={0}
            defaultValue={defaultThreshold}
            className="ctrl"
          />
        </label>
      )}

      {/* Always submit the threshold value even when hidden, so we don't lose it */}
      {!enabled && (
        <input type="hidden" name="free_delivery_threshold" value={defaultThreshold} />
      )}
    </div>
  );
}
