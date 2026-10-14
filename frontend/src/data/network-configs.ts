import { NetworkConfig, NetworkPackage } from '@/types';

/**
 * Supported Sri Lankan Telecom & ISP Network Configurations.
 * Only verified server-compatible networks are marked as 'active'.
 * This list is modular and can be configured as backend server capabilities expand.
 */
export const supportedNetworks: NetworkConfig[] = [
  {
    id: 'dialog',
    name: 'Dialog',
    category: 'dialog',
    carrierBadge: 'Dialog Axiata 4G / Home WiFi',
    shortDescription: 'Optimized SNI routing for Dialog 4G Mobile Data and Home Broadband Routers.',
    supportedProtocols: ['VLESS + Reality', 'WebSocket TLS'],
    recommendedFor: 'Dialog Unlimited Zoom / Video / Work & Learn packages',
    pingEstimate: '32ms - 42ms',
    status: 'active',
    verified: true,
  },
  {
    id: 'hutch',
    name: 'Hutch',
    category: 'hutch',
    carrierBadge: 'Hutchison 4G Cliq',
    shortDescription: 'Direct Singapore peering configured for Hutch 078/072 4G networks.',
    supportedProtocols: ['VLESS + Reality', 'gRPC TLS'],
    recommendedFor: 'Hutch Cliq & Social Unlimited add-ons',
    pingEstimate: '35ms - 45ms',
    status: 'active',
    verified: true,
  },
  {
    id: 'mobitel',
    name: 'Mobitel',
    category: 'mobitel',
    carrierBadge: 'SLT-Mobitel 4G OneShot',
    shortDescription: 'Low-latency Singapore node optimized for Mobitel mobile 4G & Pocket WiFi.',
    supportedProtocols: ['VLESS + Reality', 'WebSocket TLS'],
    recommendedFor: 'Mobitel OneShot Ultra & Non-stop Work packages',
    pingEstimate: '30ms - 40ms',
    status: 'active',
    verified: true,
  },
  {
    id: 'airtel',
    name: 'Airtel',
    category: 'airtel',
    carrierBadge: 'Airtel 4G Freedom',
    shortDescription: 'High-speed encrypted bypass route for Airtel Lanka 4G LTE connections.',
    supportedProtocols: ['VLESS + Reality', 'HTTPUpgrade'],
    recommendedFor: 'Airtel Freedom Packs & Unlimited Social bundles',
    pingEstimate: '34ms - 44ms',
    status: 'active',
    verified: true,
  },
  {
    id: 'slt',
    name: 'SLT Fibre',
    category: 'slt',
    carrierBadge: 'SLT Megaline & Fibre FTTH',
    shortDescription: 'Ultra-low ping direct routing for SLT Fibre & ADSL home connections.',
    supportedProtocols: ['VLESS + Reality (gRPC)', 'WebSocket TLS'],
    recommendedFor: 'SLT Fibre Gaming, Work from Home & Meeting bundles',
    pingEstimate: '28ms - 36ms',
    status: 'active',
    verified: true,
  },
];

export function getNetworkConfig(id?: string): NetworkConfig | undefined {
  if (!id) return undefined;
  return supportedNetworks.find((n) => n.id.toLowerCase() === id.toLowerCase());
}

/**
 * Detailed Sri Lankan ISP Bypass Packages.
 * Categorized by ISP: SLT, Dialog, Hutch, Airtel, Mobitel.
 */
export const defaultNetworkPackages: NetworkPackage[] = [
  // ==========================================
  // 🔹 SLT Packages
  // ==========================================
  {
    id: 'slt-zoom',
    name: 'SLT ZOOM (Fibre, 4G, ADSL)',
    isp: 'slt',
    ispName: 'SLT',
    status: 'active',
    serverLocation: 'SG SERVER',
    validity: '1 Month',
    p2pTorrent: 'Restricted',
    speedLimit: 'No Speed Limit',
    popular: false,
    features: [
      'No Speed Limit',
      'Works with Meet Lite/Max',
      'Works with Flash 5/10',
      'Unlimited Device Login',
    ],
    supportedProtocols: ['VLESS + Reality', 'WebSocket TLS'],
    latency: '28ms - 36ms',
    description: 'Bypass for SLT Zoom, Teams and Meeting learning bundles across Fibre, 4G & ADSL.',
  },
  {
    id: 'slt-netflix',
    name: 'SLT NETFLIX (Fibre, 4G, ADSL)',
    isp: 'slt',
    ispName: 'SLT',
    status: 'active',
    serverLocation: 'SG SERVER',
    validity: '1 Month',
    p2pTorrent: 'Restricted',
    speedLimit: 'No Speed Limit',
    popular: true,
    features: [
      'Works with 1990 Netflix package',
      'No Speed Limit',
      'SLT Fiber / 4G',
      'Unlimited Device Login',
    ],
    supportedProtocols: ['VLESS + Reality', 'gRPC TLS'],
    latency: '28ms - 36ms',
    description: 'Ultra-fast Netflix streaming SNI tunnel with high bandwidth throughput on SLT network.',
  },
  {
    id: 'slt-prepaid-235',
    name: 'SLT ZOOM PREPAID 235',
    isp: 'slt',
    ispName: 'SLT',
    status: 'active',
    serverLocation: 'SG SERVER',
    validity: '1 Month',
    p2pTorrent: 'Restricted',
    speedLimit: 'No Speed Limit',
    popular: false,
    features: [
      'No Speed Limit',
      'SLT 4G Prepaid only',
      '235 package',
      'Unlimited Device Login',
    ],
    supportedProtocols: ['VLESS + Reality', 'WebSocket TLS'],
    latency: '30ms - 40ms',
    description: 'Optimized specifically for SLT 4G prepaid SIMs activated with the Rs. 235 Zoom card.',
  },

  // ==========================================
  // 🔹 Dialog Packages
  // ==========================================
  {
    id: 'dialog-router-zoom',
    name: 'Dialog (Wifi Router) ZOOM Unlimited',
    isp: 'dialog',
    ispName: 'Dialog',
    status: 'active',
    serverLocation: 'SG SERVER',
    validity: '1 Month',
    p2pTorrent: 'Restricted',
    speedLimit: 'No Speed Limit',
    popular: true,
    features: [
      'Dialog Home Broadband Router',
      'No Speed Limit',
      'Works with Work & Learn / Zoom',
      'Unlimited Device Login',
    ],
    supportedProtocols: ['VLESS + Reality', 'WebSocket TLS'],
    latency: '32ms - 42ms',
    description: 'Optimized SNI tunneling for Dialog Home Broadband 4G WiFi Routers.',
  },
  {
    id: 'dialog-sim-zoom-724',
    name: 'Dialog (Sim) ZOOM 724 Unlimited (speed limited)',
    isp: 'dialog',
    ispName: 'Dialog',
    status: 'active',
    serverLocation: 'SG SERVER',
    validity: '1 Month',
    p2pTorrent: 'Restricted',
    speedLimit: 'Speed Limited (724 Plan)',
    popular: false,
    features: [
      'Dialog Mobile SIM 4G',
      '724 Unlimited Plan',
      'Speed Limited by Carrier',
      'Unlimited Device Login',
    ],
    supportedProtocols: ['VLESS + Reality', 'WebSocket TLS'],
    latency: '34ms - 45ms',
    description: 'Specifically engineered for the Dialog 724 Zoom & Video unlimited prepaid SIM package.',
  },
  {
    id: 'dialog-social',
    name: 'Dialog Mobile Social Media',
    isp: 'dialog',
    ispName: 'Dialog',
    status: 'active',
    serverLocation: 'SG SERVER',
    validity: '1 Month',
    p2pTorrent: 'Restricted',
    speedLimit: 'No Speed Limit',
    popular: false,
    features: [
      'Dialog Social Media Pack',
      'Facebook / WhatsApp / YouTube',
      'No Speed Limit',
      'Unlimited Device Login',
    ],
    supportedProtocols: ['VLESS + Reality', 'HTTPUpgrade'],
    latency: '32ms - 42ms',
    description: 'Disguises total internet traffic under Dialog Social Media and Video unlimited plans.',
  },

  // ==========================================
  // 🔹 Hutch Packages
  // ==========================================
  {
    id: 'hutch-social',
    name: 'Hutch Social Media',
    isp: 'hutch',
    ispName: 'Hutch',
    status: 'active',
    serverLocation: 'SG SERVER',
    validity: '1 Month',
    p2pTorrent: 'Restricted',
    speedLimit: 'No Speed Limit',
    popular: true,
    features: [
      'Hutch Social Unlimited / Cliq',
      'No Speed Limit',
      'Direct Singapore SG Route',
      'Unlimited Device Login',
    ],
    supportedProtocols: ['VLESS + Reality', 'gRPC TLS'],
    latency: '35ms - 45ms',
    description: 'Direct routing through Singapore nodes for Hutch 078/072 4G Social packages.',
  },
  {
    id: 'hutch-tiktok',
    name: 'Hutch TikTok',
    isp: 'hutch',
    ispName: 'Hutch',
    status: 'active',
    serverLocation: 'SG SERVER',
    validity: '1 Month',
    p2pTorrent: 'Restricted',
    speedLimit: 'No Speed Limit',
    popular: false,
    features: [
      'Hutch TikTok Add-on',
      'No Speed Limit',
      'High Bandwidth Throughput',
      'Unlimited Device Login',
    ],
    supportedProtocols: ['VLESS + Reality', 'WebSocket TLS'],
    latency: '36ms - 46ms',
    description: 'SNI bypass utilizing Hutch TikTok unlimited data quotas for full web surfing.',
  },

  // ==========================================
  // 🔹 Airtel Packages
  // ==========================================
  {
    id: 'airtel-tiktok',
    name: 'Airtel TikTok Unlimited',
    isp: 'airtel',
    ispName: 'Airtel',
    status: 'active',
    serverLocation: 'SG SERVER',
    validity: '1 Month',
    p2pTorrent: 'Restricted',
    speedLimit: 'No Speed Limit',
    popular: true,
    features: [
      'Airtel TikTok Unlimited Pack',
      'Ultra Low Latency Route',
      'No Speed Limit',
      'Unlimited Device Login',
    ],
    supportedProtocols: ['VLESS + Reality', 'HTTPUpgrade'],
    latency: '34ms - 44ms',
    description: 'Bypasses Airtel TikTok package traffic seamlessly to open full uncapped internet.',
  },
  {
    id: 'airtel-social',
    name: 'Airtel Social Media',
    isp: 'airtel',
    ispName: 'Airtel',
    status: 'active',
    serverLocation: 'SG SERVER',
    validity: '1 Month',
    p2pTorrent: 'Restricted',
    speedLimit: 'No Speed Limit',
    popular: false,
    features: [
      'Airtel Unlimited Social Bundles',
      'Works with WhatsApp / FB pack',
      'No Speed Limit',
      'Unlimited Device Login',
    ],
    supportedProtocols: ['VLESS + Reality', 'WebSocket TLS'],
    latency: '34ms - 44ms',
    description: 'Encrypted tunnel disguised as Airtel Freedom Social bundles with zero packet drop.',
  },
  {
    id: 'airtel-data',
    name: 'Airtel Data Packages',
    isp: 'airtel',
    ispName: 'Airtel',
    status: 'active',
    serverLocation: 'SG SERVER',
    validity: '1 Month',
    p2pTorrent: 'Restricted',
    speedLimit: 'No Speed Limit',
    popular: false,
    features: [
      'Airtel Freedom & Data Packs',
      'Dedicated Singapore IP',
      'No Speed Limit',
      'Unlimited Device Login',
    ],
    supportedProtocols: ['VLESS + Reality', 'WebSocket TLS'],
    latency: '35ms - 45ms',
    description: 'General high-speed Singapore peering tunnel for all standard Airtel 4G data plans.',
  },

  // ==========================================
  // 🔹 Mobitel Packages
  // ==========================================
  {
    id: 'mobitel-oneshot',
    name: 'Mobitel OneShot Ultra',
    isp: 'mobitel',
    ispName: 'Mobitel',
    status: 'active',
    serverLocation: 'SG SERVER',
    validity: '1 Month',
    p2pTorrent: 'Restricted',
    speedLimit: 'No Speed Limit',
    popular: true,
    features: [
      'Mobitel OneShot Ultra Pack',
      'Direct Singapore SG Route (30ms)',
      'No Speed Limit',
      'Unlimited Device Login',
    ],
    supportedProtocols: ['VLESS + Reality', 'WebSocket TLS'],
    latency: '30ms - 40ms',
    description: 'Tunnel for SLT-Mobitel OneShot Ultra streaming and social data allocations.',
  },
  {
    id: 'mobitel-work-learn',
    name: 'Mobitel Non-Stop Work & Learn',
    isp: 'mobitel',
    ispName: 'Mobitel',
    status: 'active',
    serverLocation: 'SG SERVER',
    validity: '1 Month',
    p2pTorrent: 'Restricted',
    speedLimit: 'No Speed Limit',
    popular: false,
    features: [
      'Mobitel Zoom / Teams / eLearning',
      '4G Mobile & Pocket WiFi',
      'No Speed Limit',
      'Unlimited Device Login',
    ],
    supportedProtocols: ['VLESS + Reality', 'WebSocket TLS'],
    latency: '30ms - 40ms',
    description: 'Disguises web traffic as Mobitel eLearning/Work bundle for unlimited browsing.',
  },
  {
    id: 'mobitel-social',
    name: 'Mobitel Unlimited Social Media',
    isp: 'mobitel',
    ispName: 'Mobitel',
    status: 'active',
    serverLocation: 'SG SERVER',
    validity: '1 Month',
    p2pTorrent: 'Restricted',
    speedLimit: 'No Speed Limit',
    popular: false,
    features: [
      'Mobitel Social Media Addon',
      'Facebook / WhatsApp / Instagram',
      'No Speed Limit',
      'Unlimited Device Login',
    ],
    supportedProtocols: ['VLESS + Reality', 'HTTPUpgrade'],
    latency: '30ms - 40ms',
    description: 'Optimized SNI tunneling for Mobitel unlimited social media packages.',
  },
];

export function getNetworkPackage(id?: string): NetworkPackage | undefined {
  if (!id) return undefined;
  return defaultNetworkPackages.find((p) => p.id.toLowerCase() === id.toLowerCase());
}

export function getNetworkPackagesByIsp(isp: string): NetworkPackage[] {
  if (!isp || isp === 'all') return defaultNetworkPackages;
  return defaultNetworkPackages.filter((p) => p.isp.toLowerCase() === isp.toLowerCase());
}
