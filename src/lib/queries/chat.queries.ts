import { useMutation, useQuery } from '@tanstack/react-query';
import { getModelNames, getResponseFromModel } from '../../../api/apiClient';

export const useGetModelNames = () => {
  return useQuery({
    queryKey: ['models'],
    queryFn: async () => {
      const data = await getModelNames();
      return data;
    },
  });
};

export const useGetResponseFromModel = () => {
  return useMutation({
    mutationFn: async ({
      selectedModel,
      message,
    }: {
      selectedModel: string;
      message: string;
    }) => {
      const data = await getResponseFromModel({ selectedModel, message });
      return data;
    },
  });
};
