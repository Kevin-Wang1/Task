"use client";

import { useState } from "react";
import MapView from "@/components/MapView";
import StackPanel from "@/components/StackPanel";

export default function Home() {
  const [selectedDeviceId, setSelectedDeviceId] = useState("device_001");

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 lg:grid-cols-[1.4fr_1fr]">
        <section>
          <MapView
            selectedDeviceId={selectedDeviceId}
            onSelectDevice={setSelectedDeviceId}
          />
        </section>

        <aside>
          <StackPanel deviceId={selectedDeviceId} />
        </aside>
      </div>
    </main>
  );
}