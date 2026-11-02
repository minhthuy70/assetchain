"use client";

export function CardSkeleton() {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/40 p-5 space-y-4 animate-pulse">
      <div className="h-44 w-full rounded-2xl bg-slate-800/60" />
      <div className="space-y-2">
        <div className="h-4 w-3/4 rounded-md bg-slate-800" />
        <div className="h-3 w-1/2 rounded-md bg-slate-800/60" />
      </div>
      <div className="h-8 w-full rounded-xl bg-slate-800/50" />
    </div>
  );
}

export function TableRowSkeleton() {
  return (
    <tr className="border-b border-slate-800 animate-pulse">
      <td className="p-4"><div className="h-4 w-28 bg-slate-800 rounded" /></td>
      <td className="p-4"><div className="h-4 w-20 bg-slate-800/60 rounded" /></td>
      <td className="p-4"><div className="h-4 w-32 bg-slate-800/40 rounded" /></td>
      <td className="p-4"><div className="h-6 w-16 bg-slate-800 rounded-full" /></td>
    </tr>
  );
}

export function DetailSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-64 bg-slate-800 rounded-xl" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="h-64 rounded-2xl bg-slate-800/60" />
        <div className="md:col-span-2 space-y-4">
          <div className="h-6 w-3/4 bg-slate-800 rounded-md" />
          <div className="h-16 w-full bg-slate-800/40 rounded-xl" />
          <div className="h-24 w-full bg-slate-800/30 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
