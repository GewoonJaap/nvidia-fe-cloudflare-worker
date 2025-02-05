import { NvidiaStore } from '../types/ConstTypes';

export const NVIDIA_STORES: NvidiaStore[] = [
  {
    country: 'nl',
    productApiUrls: [
      {
        url: 'https://api.store.nvidia.com/partner/v1/feinventory?skus=PROGFTNV590&locale=nl-nl',
        consumerUrl: 'https://marketplace.nvidia.com/nl-nl/consumer/graphics-cards/nvidia-geforce-rtx-5090/',
        name: 'Nvidia RTX 5090 Founders Edition',
      },
      {
        url: 'https://api.store.nvidia.com/partner/v1/feinventory?skus=5090FEPROSHOP&locale=nl-nl',
        consumerUrl: 'https://marketplace.nvidia.com/nl-nl/consumer/graphics-cards/nvidia-geforce-rtx-5090/',
        name: 'Nvidia RTX 5090 Founders Edition',
      },
    ],
  },
];
