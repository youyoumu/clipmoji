import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ReactNode } from "react";

const gifCardNodeCache = new Map<string, ReactNode>();

export function useGifCardNodeCache({ id }: { id: string }) {
  return useQuery({
    queryKey: ["gifCardNodeCache", { id }],
    queryFn() {
      return gifCardNodeCache.get(id) ?? null;
    },
  });
}

export function useUpdateGifCardNodeCache() {
  const queryClient = useQueryClient();
  return useMutation({
    async mutationFn({ id, node }: { id: string; node: ReactNode }) {
      gifCardNodeCache.set(id, node);
      return { id };
    },
    onSuccess({ id }) {
      queryClient.invalidateQueries({
        queryKey: ["gifCardNodeCache", { id }],
      });
    },
  });
}
