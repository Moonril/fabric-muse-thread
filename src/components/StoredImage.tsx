import { useQuery } from "@tanstack/react-query";
import { ImageOff } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { signedUrl } from "@/lib/projects";
import { cn } from "@/lib/utils";

function isRemoteUrl(path: string) {
  return /^https?:\/\//i.test(path);
}

export function StoredImage({
  path,
  alt,
  className,
}: {
  path: string | null | undefined;
  alt: string;
  className?: string;
}) {
  const remote = Boolean(path) && isRemoteUrl(path as string);
  const { data, isPending, isError } = useQuery({
    queryKey: ["signed-url", path],
    queryFn: () => signedUrl(path as string),
    enabled: Boolean(path) && !remote,
    staleTime: 1000 * 60 * 30,
  });

  if (!path || (!remote && isError)) {
    return (
      <div className={cn("flex items-center justify-center bg-muted text-muted-foreground", className)}>
        <ImageOff className="h-5 w-5" aria-hidden />
        <span className="sr-only">{alt}</span>
      </div>
    );
  }

  if (!remote && isPending) return <Skeleton className={className} />;

  return (
    <img src={remote ? path : data} alt={alt} loading="lazy" className={cn("object-cover", className)} />
  );
}