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
    name: 'MSI GeForce RTX 5090 SUPRIM SOC',
  },
  {
    url: 'https://www.coolblue.nl/product/959802?utm_medium=android-app&utm_source=referral&utm_campaign=product-share',
    name: 'MSI GeForce RTX 5090 GAMING TRIO OC',
  },
  {
    url: 'https://www.coolblue.nl/product/959803?utm_medium=android-app&utm_source=referral&utm_campaign=product-share',
    name: 'MSI GeForce RTX 5090 VENTUS 3X OC',
  },
  {
    url: 'https://www.coolblue.nl/product/959795?utm_medium=android-app&utm_source=referral&utm_campaign=product-share',
    name: 'MSI GeForce RTX 5080 GAMING TRIO',
  },
  {
    url: 'https://www.coolblue.nl/product/959793?utm_medium=android-app&utm_source=referral&utm_campaign=product-share',
    name: 'MSI GeForce RTX 5080 SUPRIM SOC',
  },
];

export const BOL_PRODUCTS = [
  {
    url: 'https://www.bol.com/nl/nl/p/msi-nvidia-geforce-rtx-5090-32g-gaming-trio-oc-videokaart-32gb-gddr7-pcie-5-0-1x-hdmi-2-1b-3x-displayport-2-1a/9300000222902218/?bltgh=fa83d7e9-c9aa-4105-b101-43cc316c0b14.wishlist_details_page_products.WishlistDetailProductCardItem_4.ProductTitle',
    name: 'MSI - NVIDIA GeForce RTX 5090 32G GAMING TRIO OC',
  },
  {
    url: 'https://www.bol.com/nl/nl/p/msi-nvidia-geforce-rtx-5090-32g-suprim-liquid-soc-videokaart-32gb-gddr7-pcie-5-0-1x-hdmi-2-1b-3x-displayport-2-1a/9300000222902221/?bltgh=fa83d7e9-c9aa-4105-b101-43cc316c0b14.wishlist_details_page_products.WishlistDetailProductCardItem_3.ProductTitle',
    name: 'MSI - NVIDIA GeForce RTX 5090 32G SUPRIM LIQUID SOC',
  },
  {
    url: 'https://www.bol.com/nl/nl/p/msi-ventus-geforce-rtx-5090-32g-3x-oc-videokaart-nvidia-32-gb-gddr7/9300000222902226/?bltgh=fa83d7e9-c9aa-4105-b101-43cc316c0b14.wishlist_details_page_products.WishlistDetailProductCardItem_2.ProductTitle',
    name: 'MSI VENTUS GEFORCE RTX 5090 32G 3X OC',
  },
  {
    url: 'https://www.bol.com/nl/nl/p/gigabyte-geforce-rtx-5090-windforce-oc-32g-nvidia-32-gb-gddr7/9300000224382653/?bltgh=fa83d7e9-c9aa-4105-b101-43cc316c0b14.wishlist_details_page_products.WishlistDetailProductCardItem_1.ProductTitle',
    name: 'GIGABYTE GeForce RTX 5090 WINDFORCE OC',
  },
  {
    url: 'https://www.bol.com/nl/nl/p/pny-geforce-rtx-5090-oc-nvidia-32-gb-gddr7/9300000224383133/?bltgh=fa83d7e9-c9aa-4105-b101-43cc316c0b14.wishlist_details_page_products.WishlistDetailProductCardItem_0.ProductTitle',
    name: 'PNY GeForce RTX 5090',
  },
  {
    url: 'https://www.bol.com/nl/nl/p/asus-rog-astral-rtx5090-o32g-gaming-nvidia-geforce-rtx-5090-32-gb-gddr7/9300000224382989/?referrer=socialshare_pdp_iphoneapp',
    name: 'ASUS ROG Astral - -RTX5090',
  },
  {
    url: 'https://www.bol.com/nl/nl/p/msi-nvidia-geforce-rtx-5080-16g-ventus-3x-oc-videokaart-16gb-gddr7-pcie-5-0-1x-hdmi-2-1b-3x-displayport-2-1a/9300000222902227/?bltgh=u3E1zM-Zzys8R5TGxlhIWw.twlOJS0pcVOjdev1Cn5BMg_0_16.42.ProductTitle',
    name: 'MSI GeForce RTX 5080 16G VENTUS',
  },
];

export const ALTERNATE_STORE = [
  {
    url: 'https://www.alternate.de/GIGABYTE/GeForce-RTX-5090-AORUS-MASTER-32G-Grafikkarte/html/product/100108932',
    name: 'GIGABYTE GeForce RTX 5090 AORUS MASTER 32G',
  },
];

export const GPU_SERIES = {
  '5080': '5080',
  '5090': '5090',
};
