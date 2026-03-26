"use client";

type MapViewProps = {
  selectedDeviceId: string;
  onSelectDevice: (deviceId: string) => void;
};

type DevicePoint = {
  id: string;
  name: string;
  x: string;
  y: string;
  labelX: string;
  labelY: string;
};

const devices: DevicePoint[] = [
  {
    id: "device_001",
    name: "Mine Sensor 001",
    x: "60%",
    y: "51%",
    labelX: "calc(46% + 34px)",
    labelY: "calc(43% - 18px)",
  },
  {
    id: "device_002",
    name: "Mine Sensor 002",
    x: "43%",
    y: "70%",
    labelX: "calc(15% + 34px)",
    labelY: "calc(69% - 16px)",
  },
  {
    id: "device_003",
    name: "Mine Sensor 003",
    x: "88%",
    y: "51%",
    labelX: "calc(74% + 34px)",
    labelY: "calc(43% - 18px)",
  },
];

export default function MapView({
  selectedDeviceId,
  onSelectDevice,
}: MapViewProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-semibold text-gray-900">
        Mine Configurator
      </h1>

      <p className="mt-2 text-sm text-gray-500">
        Click a device point in the mine shaft cross-section to load its stack
        data.
      </p>

      <div className="mt-6 rounded-2xl border border-gray-200 bg-stone-50 p-4">
        <div className="relative mx-auto h-[640px] w-full max-w-[860px] overflow-hidden rounded-2xl bg-[#c9ced4]">
          <div className="absolute inset-x-0 top-0 h-[150px] bg-[#e8edf4]" />
          <div className="absolute inset-x-0 top-[150px] bottom-0 bg-[linear-gradient(to_bottom,_#c9c4c2_0%,_#b9b3b0_45%,_#938b86_100%)]" />
          <div className="absolute inset-x-0 top-[150px] border-t-[3px] border-[#46546b]" />

          <div className="absolute left-[28px] top-[162px] text-[15px] font-semibold text-[#31435f]">
            Surface
          </div>

          <div className="absolute left-[42px] top-[230px] text-[14px] text-white/65">
            100m
          </div>
          <div className="absolute left-[42px] top-[320px] text-[14px] text-white/65">
            200m
          </div>
          <div className="absolute left-[42px] top-[410px] text-[14px] text-white/65">
            300m
          </div>
          <div className="absolute left-[42px] top-[500px] text-[14px] text-white/65">
            400m
          </div>

          {/* Vertical shaft */}
          <div className="absolute left-[43%] top-[150px] h-[340px] w-[138px] -translate-x-1/2 rounded-[22px] bg-[#5a514b]" />
          <div className="absolute left-[43%] top-[165px] h-[310px] w-[82px] -translate-x-1/2 rounded-[14px] bg-[#171312]" />
          <div className="absolute left-[43%] top-[245px] h-[2px] w-[82px] -translate-x-1/2 bg-[#5e554f]" />
          <div className="absolute left-[43%] top-[335px] h-[2px] w-[82px] -translate-x-1/2 bg-[#5e554f]" />
          <div className="absolute left-[43%] top-[425px] h-[2px] w-[82px] -translate-x-1/2 bg-[#5e554f]" />

          {/* Horizontal tunnel */}
          <div className="absolute left-[49%] top-[300px] h-[50px] w-[290px] rounded-[20px] border-[4px] border-[#171312] bg-[#2a2422]" />
          <div className="absolute left-[52%] top-[312px] h-[26px] w-[248px] rounded-[14px] bg-[#403832]" />

          {/* Structure labels */}
          <div className="absolute left-[43%] top-[505px] -translate-x-1/2 text-[16px] font-semibold text-white/90">
            Vertical Mine Shaft
          </div>

          <div className="absolute left-[72%] top-[455px] -translate-x-1/2 text-[16px] font-semibold text-white/90">
            Horizontal Mine Tunnel
          </div>

          {/* Device points + labels */}
          {devices.map((device) => {
            const isSelected = selectedDeviceId === device.id;

            return (
              <div key={device.id}>
                <button
                  type="button"
                  onClick={() => onSelectDevice(device.id)}
                  className="absolute -translate-x-1/2 -translate-y-1/2"
                  style={{ left: device.x, top: device.y }}
                >
                  <div className="relative">
                    <div
                      className={`h-7 w-7 rounded-full border-4 border-white shadow-lg transition ${
                        isSelected
                          ? "scale-110 bg-blue-600"
                          : "bg-red-500 hover:bg-red-400"
                      }`}
                    />
                    <div className="absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white" />
                  </div>
                </button>

                <div
                  className="absolute rounded-lg bg-white/84 px-3 py-2 shadow-sm backdrop-blur-[2px]"
                  style={{ left: device.labelX, top: device.labelY }}
                >
                  <div
                    className={`text-[15px] font-bold leading-none ${
                      isSelected ? "text-blue-700" : "text-gray-800"
                    }`}
                  >
                    {device.id}
                  </div>
                  <div className="mt-1 text-xs leading-tight text-gray-600">
                    {device.name}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}