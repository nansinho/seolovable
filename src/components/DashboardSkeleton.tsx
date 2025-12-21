import { Skeleton } from "@/components/ui/skeleton";

export const StatsSkeleton = () => (
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
    {[...Array(4)].map((_, i) => (
      <div key={i} className="p-4 rounded-lg border border-border bg-card">
        <Skeleton className="h-3 w-20 mb-2" />
        <Skeleton className="h-8 w-16" />
      </div>
    ))}
  </div>
);

export const SiteCardSkeleton = () => (
  <div className="p-3 rounded-lg border border-border bg-background">
    <div className="flex items-start justify-between mb-2">
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-4 rounded" />
        <Skeleton className="h-4 w-32" />
      </div>
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-4" />
      </div>
    </div>
    <div className="flex items-center justify-between">
      <Skeleton className="h-4 w-16" />
      <Skeleton className="h-3 w-24" />
    </div>
  </div>
);

export const SitesListSkeleton = () => (
  <div className="space-y-3">
    {[...Array(3)].map((_, i) => (
      <SiteCardSkeleton key={i} />
    ))}
  </div>
);

export const ChartSkeleton = () => (
  <div className="h-[200px] flex items-end gap-2 p-4">
    {[...Array(7)].map((_, i) => (
      <Skeleton 
        key={i} 
        className="flex-1 rounded-t" 
        style={{ height: `${Math.random() * 60 + 40}%` }} 
      />
    ))}
  </div>
);

export const TableRowSkeleton = () => (
  <tr className="border-t border-border">
    <td className="p-4"><Skeleton className="h-4 w-32" /></td>
    <td className="p-4"><Skeleton className="h-4 w-24" /></td>
    <td className="p-4"><Skeleton className="h-6 w-16" /></td>
    <td className="p-4"><Skeleton className="h-4 w-12" /></td>
    <td className="p-4"><Skeleton className="h-4 w-20" /></td>
    <td className="p-4 text-right">
      <div className="flex items-center justify-end gap-2">
        <Skeleton className="h-8 w-8" />
        <Skeleton className="h-8 w-8" />
      </div>
    </td>
  </tr>
);

export const AdminTableSkeleton = () => (
  <div className="rounded-lg border border-border bg-card overflow-hidden">
    <table className="w-full">
      <thead className="bg-muted/50">
        <tr>
          <th className="text-left p-4"><Skeleton className="h-4 w-16" /></th>
          <th className="text-left p-4"><Skeleton className="h-4 w-12" /></th>
          <th className="text-left p-4"><Skeleton className="h-4 w-10" /></th>
          <th className="text-left p-4"><Skeleton className="h-4 w-10" /></th>
          <th className="text-left p-4"><Skeleton className="h-4 w-16" /></th>
          <th className="text-right p-4"><Skeleton className="h-4 w-16" /></th>
        </tr>
      </thead>
      <tbody>
        {[...Array(5)].map((_, i) => (
          <TableRowSkeleton key={i} />
        ))}
      </tbody>
    </table>
  </div>
);

export const QuotaSkeleton = () => (
  <div className="p-4 lg:p-6 rounded-lg border border-border bg-card mb-6">
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
      <div className="flex items-center gap-2">
        <Skeleton className="h-5 w-5" />
        <Skeleton className="h-5 w-28" />
      </div>
      <div className="flex items-center gap-2">
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-8 w-36" />
      </div>
    </div>
    <Skeleton className="h-4 w-40 mb-2" />
    <Skeleton className="h-2 w-full" />
  </div>
);

export const DashboardContentSkeleton = () => (
  <div className="space-y-6">
    <QuotaSkeleton />
    <StatsSkeleton />
    <div className="p-4 lg:p-6 rounded-lg border border-border bg-card">
      <div className="flex items-center justify-between mb-6">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-4 w-24" />
      </div>
      <ChartSkeleton />
    </div>
    <div className="grid lg:grid-cols-2 gap-6">
      <div className="p-4 lg:p-6 rounded-lg border border-border bg-card">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-4 w-16" />
        </div>
        <SitesListSkeleton />
      </div>
      <div className="p-4 lg:p-6 rounded-lg border border-border bg-card">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-5 w-32" />
        </div>
        <Skeleton className="h-48 w-full" />
      </div>
    </div>
  </div>
);
