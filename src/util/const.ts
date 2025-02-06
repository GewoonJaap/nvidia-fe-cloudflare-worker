import { NvidiaStore } from '../types/ConstTypes';

export const NVIDIA_STORES: NvidiaStore[] = [
  {
    country: 'nl',
    productApiUrls: [
      {
        url: 'https://api.store.nvidia.com/partner/v1/feinventory?skus=',
        consumerUrl: 'https://marketplace.nvidia.com/nl-nl/consumer/graphics-cards/nvidia-geforce-rtx-5090/',
        name: 'Nvidia RTX 5090 Founders Edition',
      },
      {
        url: 'https://api.store.nvidia.com/partner/v1/feinventory?skus=',
        consumerUrl: 'https://marketplace.nvidia.com/nl-nl/consumer/graphics-cards/nvidia-geforce-rtx-5080/',
        name: 'Nvidia RTX 5080 Founders Edition',
      },
    ],
  },
];

export const COOLBLUE_PRODUCTS = [
  {
    url: 'https://www.coolblue.nl/product/959801?utm_medium=android-app&utm_source=referral&utm_campaign=product-share',
    name: 'MSI GeForce RTX 5090 SUPRIM SOC 32GB',
  },
  {
    url: 'https://www.coolblue.nl/product/959802?utm_medium=android-app&utm_source=referral&utm_campaign=product-share',
    name: 'MSI GeForce RTX 5090 GAMING TRIO OC 32GB',
  },
  {
    url: 'https://www.coolblue.nl/product/959803?utm_medium=android-app&utm_source=referral&utm_campaign=product-share',
    name: 'MSI GeForce RTX 5090 VENTUS 3X OC 32GB',
  },
];
