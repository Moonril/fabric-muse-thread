import { useQuery } from "@tanstack/react-query";
import { ImageOff } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { signedUrl } from "@/lib/projects";
import { cn } from "@/lib/utils";

export function StoredImage({
  path,
  alt,
  className,
}: {
  path: string | null | undefined;
  alt: string;
  className?: string;
}) {
  const { data, isPending, isError } = useQuery({
    queryKey: ["signed-url", path],
    queryFn: () => signedUrl(path as string),
    enabled: Boolean(path),
    staleTime: 1000 * 60 * 30,
  });

  if (!path || isError) {
    return (
      <div className={cn("flex items-center justify-center bg-muted text-muted-foreground", className)}>
        <ImageOff className="h-5 w-5" aria-hidden />
        <span className="sr-only">{alt}</span>
      </div>
    );
  }

  if (isPending) return <Skeleton className={className} />;

  return <img src={data} alt={alt} loading="lazy" className={cn("object-cover", className)} />;
}