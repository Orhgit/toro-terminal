"use client";

import { type DashboardProperty, STATUS_CONFIG } from "../data/mock";

function formatPrice(price: number): string {
  return new Intl.NumberFormat("he-IL", {
    style: "currency",
    currency: "ILS",
    maximumFractionDigits: 0,
  }).format(price);
}

function StatusBadge({ status }: { status: DashboardProperty["marketingStatus"] }) {
  const config = STATUS_CONFIG[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${config.bgColor} ${config.textColor}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${config.dotColor} ${config.pulse ? "status-pulse" : ""}`}
      />
      {config.label}
    </span>
  );
}

interface PropertiesTableProps {
  data: DashboardProperty[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function PropertiesTable({
  data,
  selectedId,
  onSelect,
}: PropertiesTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-(--color-border) bg-(--color-surface) shadow-sm">
      <table className="w-full text-right text-sm">
        <thead>
          <tr className="border-b border-(--color-border) bg-(--color-surface-alt)">
            <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
              Address
            </th>
            <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
              Price
            </th>
            <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
              AI Hook
            </th>
            <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
              Vision Tags
            </th>
            <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
              Status
            </th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => {
            const isSelected = item.property.id === selectedId;
            return (
              <tr
                key={item.property.id}
                onClick={() => onSelect(item.property.id)}
                className={`cursor-pointer border-b border-(--color-border) last:border-b-0 transition-all duration-150 ${
                  isSelected
                    ? "bg-indigo-50/80 border-r-2 border-r-indigo-500"
                    : "hover:bg-slate-50"
                }`}
              >
                <td className="px-5 py-4">
                  <p className="font-medium text-gray-900">{item.address}</p>
                  <p className="mt-0.5 text-xs text-slate-400">{item.city}</p>
                </td>
                <td className="px-5 py-4 font-mono text-sm font-semibold tabular-nums text-gray-900">
                  {formatPrice(item.property.price_asked)}
                </td>
                <td className="max-w-[240px] truncate px-5 py-4 text-slate-600">
                  {item.shortHook || (
                    <span className="inline-flex items-center gap-1.5 italic text-slate-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-400 status-pulse" />
                      Processing...
                    </span>
                  )}
                </td>
                <td className="px-5 py-4">
                  <div className="flex flex-wrap gap-1">
                    {item.visionTags.length > 0 ? (
                      item.visionTags.slice(0, 2).map((tag) => (
                        <span
                          key={tag}
                          className="inline-block rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-600"
                        >
                          {tag}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs italic text-slate-300">
                        Pending
                      </span>
                    )}
                    {item.visionTags.length > 2 && (
                      <span className="inline-block rounded-md bg-slate-100 px-1.5 py-0.5 text-xs text-slate-400">
                        +{item.visionTags.length - 2}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-5 py-4">
                  <StatusBadge status={item.marketingStatus} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
