"use client";

export function CardSkeleton() {
  return (
    <div className="card-surface p-5 space-y-4 animate-pulse">
      <div className="h-44 w-full rounded-lg bg-slate-800/60" />
      <div className="space-y-2">
        <div className="h-4 w-3/4 rounded bg-slate-800" />
        <div className="h-3 w-1/2 rounded bg-slate-800/60" />
      </div>
      <div className="h-8 w-full rounded-lg bg-slate-800/50" />
    </div>
  );
}

export function TableRowSkeleton() {
  return (
    <tr className="border-b border-slate-800 animate-pulse">
      <td className="p-4"><div className="h-4 w-28 bg-slate-800 rounded" /></td>
      <td className="p-4"><div className="h-4 w-20 bg-slate-800/60 rounded" /></td>
      <td className="p-4"><div className="h-4 w-32 bg-slate-800/40 rounded" /></td>
      <td className="p-4"><div className="h-6 w-16 bg-slate-800 rounded-md" /></td>
    </tr>
  );
}

export function DetailSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-64 bg-slate-800 rounded-lg" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="h-64 rounded-lg bg-slate-800/60" />
        <div className="md:col-span-2 space-y-4">
          <div className="h-6 w-3/4 bg-slate-800 rounded" />
          <div className="h-16 w-full bg-slate-800/40 rounded-lg" />
          <div className="h-24 w-full bg-slate-800/30 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
