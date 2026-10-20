import { useMutation, useQuery } from '@tanstack/react-query';
import { STUDENT } from '../config/student';
import { useSession } from '../providers/SessionProvider';
import { queryClient } from '../services/queryClient';
import { useAppStore } from '../store/useAppStore';
import { ListResult } from '../services/itemRepository';

export function useLostItems() {
  const user = useAppStore(state => state.session?.user);
  const { repository, busy } = useSession();
  const queryKey = [STUDENT.cacheKey, user] as const;
  const query = useQuery({ queryKey, enabled: !!repository && !busy, staleTime: STUDENT.staleTime,
    queryFn: ({ signal }) => {
      if (!repository) throw new Error('Bạn chưa đăng nhập.');
      return repository.load(signal);
    },
  });
  const mutation = useMutation({
    mutationKey: ['change-lost-item', user],
    mutationFn: (command: Parameters<NonNullable<typeof repository>['change']>[0]) => {
      if (!repository || busy) throw new Error('Phiên không sẵn sàng.');
      return repository.change(command);
    },
    onSuccess: async (data: ListResult) => {
      if (useAppStore.getState().session?.user !== user) return;
      queryClient.setQueryData(queryKey, data);
      await queryClient.invalidateQueries({ queryKey });
    },
  });
  return { ...query, mutation };
}
