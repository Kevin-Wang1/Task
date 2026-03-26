"use client";

import { useCallback, useEffect, useState } from "react";

type ModuleInfo = {
  id: string;
  name: string;
  moduleType: string;
  power: number;
};

type StackItem = {
  id: number;
  deviceId: string;
  slotIndex: number;
  moduleId: string;
  module: ModuleInfo;
};

type HistoryItem = {
  id: number;
  deviceId: string;
  slotIndex: number;
  oldModuleId: string;
  newModuleId: string;
  changedAt: string;
};

type StackResponse = {
  deviceId: string;
  deviceName: string;
  geoFeatureId: string | null;
  stack: StackItem[];
  history: HistoryItem[];
};

type ReplacementOption = {
  id: string;
  name: string;
  moduleType: string;
  power: number;
};

type StackPanelProps = {
  deviceId: string;
};

export default function StackPanel({ deviceId }: StackPanelProps) {
  const [data, setData] = useState<StackResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [openSlot, setOpenSlot] = useState<number | null>(null);
  const [optionsBySlot, setOptionsBySlot] = useState<
    Record<number, ReplacementOption[]>
  >({});
  const [selectedTargetBySlot, setSelectedTargetBySlot] = useState<
    Record<number, string>
  >({});
  const [loadingOptionsSlot, setLoadingOptionsSlot] = useState<number | null>(
    null
  );
  const [replacingSlot, setReplacingSlot] = useState<number | null>(null);

  const fetchStack = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const res = await fetch(`/api/stack?deviceId=${deviceId}`, {
        cache: "no-store",
      });

      if (!res.ok) {
        const result = await res.json().catch(() => null);
        throw new Error(result?.error || "Failed to fetch stack data");
      }

      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error(err);
      setError("Unable to load stack data.");
    } finally {
      setLoading(false);
    }
  }, [deviceId]);

  useEffect(() => {
    fetchStack();
    setOpenSlot(null);
    setOptionsBySlot({});
    setSelectedTargetBySlot({});
  }, [fetchStack]);

  async function loadReplacementOptions(slotIndex: number) {
    try {
      setLoadingOptionsSlot(slotIndex);

      const res = await fetch(
        `/api/replacement-options?deviceId=${deviceId}&slotIndex=${slotIndex}`,
        { cache: "no-store" }
      );

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "Failed to load replacement options");
      }

      setOptionsBySlot((prev) => ({
        ...prev,
        [slotIndex]: result.options,
      }));

      if (result.options.length > 0) {
        setSelectedTargetBySlot((prev) => ({
          ...prev,
          [slotIndex]: result.options[0].id,
        }));
      } else {
        setSelectedTargetBySlot((prev) => ({
          ...prev,
          [slotIndex]: "",
        }));
      }

      setOpenSlot(slotIndex);
    } catch (err) {
      console.error(err);
      alert("Unable to load replacement options.");
    } finally {
      setLoadingOptionsSlot(null);
    }
  }

  async function handleConfirmReplace(slotIndex: number) {
    const newModuleId = selectedTargetBySlot[slotIndex];

    if (!newModuleId) {
      alert("Please select a target module.");
      return;
    }

    try {
      setReplacingSlot(slotIndex);

      const res = await fetch("/api/replace", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          deviceId,
          slotIndex,
          newModuleId,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "Replace failed");
      }

      await fetchStack();

      setOpenSlot(null);
      setOptionsBySlot((prev) => {
        const copy = { ...prev };
        delete copy[slotIndex];
        return copy;
      });
      setSelectedTargetBySlot((prev) => {
        const copy = { ...prev };
        delete copy[slotIndex];
        return copy;
      });
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "Replace failed.");
    } finally {
      setReplacingSlot(null);
    }
  }

  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-gray-500">Loading stack...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 shadow-sm">
        <p className="text-sm text-red-600">{error}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-gray-500">No data found.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Stack Panel</h2>
        <p className="mt-1 text-sm text-gray-500">
          Device ID: {data.deviceId}
        </p>
        <p className="text-sm text-gray-500">Device Name: {data.deviceName}</p>
        <p className="text-sm text-gray-500">
          Geo Feature ID: {data.geoFeatureId ?? "N/A"}
        </p>
      </div>

      <div className="space-y-3">
        {data.stack.map((item) => {
          const options = optionsBySlot[item.slotIndex] ?? [];
          const isOpen = openSlot === item.slotIndex;

          return (
            <div
              key={item.id}
              className="rounded-xl border border-gray-200 bg-gray-50 p-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-base font-medium text-gray-900">
                  Slot {item.slotIndex}
                </h3>
                <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
                  {item.module.moduleType}
                </span>
              </div>

              <div className="mt-3 space-y-1 text-sm text-gray-600">
                <p>
                  <span className="font-medium text-gray-800">Module ID:</span>{" "}
                  {item.module.id}
                </p>
                <p>
                  <span className="font-medium text-gray-800">Module Name:</span>{" "}
                  {item.module.name}
                </p>
                <p>
                  <span className="font-medium text-gray-800">Power:</span>{" "}
                  {item.module.power}
                </p>
              </div>

              <button
                type="button"
                onClick={() => loadReplacementOptions(item.slotIndex)}
                disabled={loadingOptionsSlot === item.slotIndex}
                className="mt-4 inline-flex rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loadingOptionsSlot === item.slotIndex
                  ? "Loading options..."
                  : "Replace"}
              </button>

              {isOpen && (
                <div className="mt-4 rounded-xl border border-gray-200 bg-white p-4">
                  {options.length === 0 ? (
                    <p className="text-sm text-gray-500">
                      No replacement options available.
                    </p>
                  ) : (
                    <>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Select target module
                      </label>

                      <select
                        value={selectedTargetBySlot[item.slotIndex] ?? ""}
                        onChange={(e) =>
                          setSelectedTargetBySlot((prev) => ({
                            ...prev,
                            [item.slotIndex]: e.target.value,
                          }))
                        }
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                      >
                        {options.map((option) => (
                          <option key={option.id} value={option.id}>
                            {option.name} ({option.id}) - power {option.power}
                          </option>
                        ))}
                      </select>

                      <div className="mt-4 flex flex-wrap gap-3">
                        <button
                          type="button"
                          onClick={() => handleConfirmReplace(item.slotIndex)}
                          disabled={replacingSlot === item.slotIndex}
                          className="inline-flex rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {replacingSlot === item.slotIndex
                            ? "Replacing..."
                            : "Confirm Replace"}
                        </button>

                        <button
                          type="button"
                          onClick={() => setOpenSlot(null)}
                          className="inline-flex rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-semibold text-gray-900">Replace History</h3>

        {data.history.length === 0 ? (
          <p className="mt-3 text-sm text-gray-500">No history yet.</p>
        ) : (
          <div className="mt-3 space-y-3">
            {data.history.map((item) => (
              <div
                key={item.id}
                className="rounded-xl border border-gray-200 bg-white p-4"
              >
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Slot:</span> {item.slotIndex}
                </p>
                <p className="text-sm text-gray-700">
                  <span className="font-medium">From:</span> {item.oldModuleId}
                </p>
                <p className="text-sm text-gray-700">
                  <span className="font-medium">To:</span> {item.newModuleId}
                </p>
                <p className="text-sm text-gray-500">
                  {new Date(item.changedAt).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}