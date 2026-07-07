"use client";

import { create } from "zustand";
import type { NodeStoreItem, NodeActivityEntry, NodeActivityAction, CreateNodeInput, UpdateNodeInput } from "@/types/node";
import { createNodeStoreItem, updateNodeStoreItem, generateId } from "@/lib/node-factories";

interface NodeStoreState {
  nodes: NodeStoreItem[];
  activityLogs: NodeActivityEntry[];
  hydrated: boolean;
}

interface NodeStoreActions {
  addNode: (input: CreateNodeInput) => string;
  updateNode: (id: string, input: UpdateNodeInput) => void;
  removeNode: (id: string) => void;
  reorderSiblings: (parentId: string | null, workspaceId: string, orderedIds: string[]) => void;
  getWorkspaceNodes: (workspaceId: string) => NodeStoreItem[];
  getWorkspaceActivityLogs: (workspaceId: string) => NodeActivityEntry[];
}

type NodeStore = NodeStoreState & NodeStoreActions;

function n(
  id: string,
  workspaceId: string,
  title: string,
  orderIndex: number,
  overrides?: Partial<Omit<NodeStoreItem, "id" | "workspaceId" | "title" | "orderIndex">>,
): NodeStoreItem {
  return {
    id,
    workspaceId,
    parentId: null,
    title,
    status: null,
    confidence: null,
    notes: "",
    lastReviewedAt: null,
    createdAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  } as NodeStoreItem;
}

function c(
  id: string,
  parentId: string,
  workspaceId: string,
  title: string,
  orderIndex: number,
  overrides?: Partial<Omit<NodeStoreItem, "id" | "parentId" | "workspaceId" | "title" | "orderIndex">>,
): NodeStoreItem {
  return {
    ...n(id, workspaceId, title, orderIndex, overrides),
    parentId,
  };
}

const CN = "seed-ws-cn";
const OS = "seed-ws-os";
const TR = "seed-ws-trees";
const DP = "seed-ws-dp";
const AR = "seed-ws-arrays";
const SD = "seed-ws-sd";

const ts = "2026-06-28T10:00:00.000Z";

const SEED_NODES: NodeStoreItem[] = [

  // ════════════════════════════════════════════════════════════════
  // Computer Networks — 6 levels deep
  // ════════════════════════════════════════════════════════════════
  n("cn-intro",       CN, "Introduction",                              0),
  n("cn-physical",    CN, "Physical Layer",                            1),
  n("cn-datalink",    CN, "Data Link Layer",                           2),
  n("cn-network",     CN, "Network Layer",                             3),
  n("cn-transport",   CN, "Transport Layer",                           4),
  n("cn-application", CN, "Application Layer",                         5),
  n("cn-security",    CN, "Network Security",                          6),
  n("cn-wireless",    CN, "Wireless & Mobile Networks",               7),

  // Introduction → children
  c("cn-intro-osi",       "cn-intro", CN, "OSI Reference Model",               0),
  c("cn-intro-tcpip",     "cn-intro", CN, "TCP/IP Model",                      1),
  c("cn-intro-topo",      "cn-intro", CN, "Network Topologies",                2),
  c("cn-intro-tx",        "cn-intro", CN, "Data Transmission Basics",          3),

  // Introduction → OSI → leaves (depth 2)
  c("cn-intro-osi-layers", "cn-intro-osi", CN, "The 7 Layers Overview",       0, { status: "done", confidence: "strong", lastReviewedAt: ts }),
  c("cn-intro-osi-vtcp",   "cn-intro-osi", CN, "OSI vs TCP/IP Comparison",    1, { status: "done", confidence: "strong", lastReviewedAt: ts }),
  c("cn-intro-osi-encap",  "cn-intro-osi", CN, "Encapsulation & Decapsulation",2, { status: "in_progress", confidence: "ok", lastReviewedAt: ts }),

  // Introduction → TCP/IP → leaves (depth 2)
  c("cn-intro-tcpip-layers",   "cn-intro-tcpip", CN, "TCP/IP Layer Functions",        0, { status: "in_progress", confidence: "ok", lastReviewedAt: ts }),
  c("cn-intro-tcpip-proto",    "cn-intro-tcpip", CN, "Key Protocols Overview",        1, { status: "not_started", confidence: null }),

  // Introduction → Topologies → leaves (depth 2)
  c("cn-intro-topo-star", "cn-intro-topo", CN, "Star Topology",           0, { status: "done", confidence: "strong", lastReviewedAt: ts }),
  c("cn-intro-topo-mesh", "cn-intro-topo", CN, "Mesh & Bus Topologies",  1, { status: "done", confidence: "ok", lastReviewedAt: ts }),
  c("cn-intro-topo-ring", "cn-intro-topo", CN, "Ring & Hybrid Topologies",2, { status: "not_started", confidence: null }),

  // Introduction → Transmission → leaves (depth 2)
  c("cn-intro-tx-simplex", "cn-intro-tx", CN, "Simplex / Half-Duplex / Full-Duplex", 0, { status: "done", confidence: "ok", lastReviewedAt: ts }),
  c("cn-intro-tx-sync",    "cn-intro-tx", CN, "Synchronous vs Asynchronous",          1, { status: "not_started", confidence: null }),

  // Physical Layer → children (depth 2)
  c("cn-phy-signaling",   "cn-physical", CN, "Signaling",                0),
  c("cn-phy-media",       "cn-physical", CN, "Transmission Media",       1),
  c("cn-phy-modulation",  "cn-physical", CN, "Modulation Techniques",    2),

  // Physical → Signaling → grandchildren (depth 3 — drill-in)
  c("cn-phy-sig-analog",    "cn-phy-signaling", CN, "Analog vs Digital Signals",      0, { status: "done", confidence: "strong", lastReviewedAt: ts }),
  c("cn-phy-sig-encoding",  "cn-phy-signaling", CN, "Line Encoding Schemes",          1, { status: "in_progress", confidence: "weak", lastReviewedAt: ts }),
  c("cn-phy-sig-mux",       "cn-phy-signaling", CN, "Multiplexing (FDM/TDM/WDM)",    2, { status: "not_started", confidence: null }),

  // Physical → Media → grandchildren
  c("cn-phy-media-guided",   "cn-phy-media", CN, "Guided Media (Coaxial, Fiber, TP)",       0, { status: "done", confidence: "strong", lastReviewedAt: ts }),
  c("cn-phy-media-unguided", "cn-phy-media", CN, "Unguided Media (Radio, Microwave)",       1, { status: "in_progress", confidence: "ok", lastReviewedAt: ts }),

  // Physical → Modulation → grandchildren
  c("cn-phy-mod-am",  "cn-phy-modulation", CN, "Amplitude Modulation",   0, { status: "done", confidence: "strong", lastReviewedAt: ts }),
  c("cn-phy-mod-fm",  "cn-phy-modulation", CN, "Frequency Modulation",  1, { status: "done", confidence: "ok", lastReviewedAt: ts }),
  c("cn-phy-mod-pcm", "cn-phy-modulation", CN, "Pulse Code Modulation", 2, { status: "not_started", confidence: null }),

  // Data Link → children
  c("cn-dl-mac",       "cn-datalink", CN, "MAC Sublayer",           0),
  c("cn-dl-llc",       "cn-datalink", CN, "LLC Sublayer",           1),
  c("cn-dl-switching", "cn-datalink", CN, "Switching & Bridging",   2),

  // Data Link → MAC → grandchildren
  c("cn-dl-mac-eth",      "cn-dl-mac", CN, "Ethernet Frame Structure",       0, { status: "done", confidence: "strong", lastReviewedAt: ts }),
  c("cn-dl-mac-csmacd",   "cn-dl-mac", CN, "CSMA/CD & CSMA/CA",             1, { status: "in_progress", confidence: "weak", lastReviewedAt: ts }),
  c("cn-dl-mac-addr",     "cn-dl-mac", CN, "MAC Addressing & ARP",           2, { status: "done", confidence: "ok", lastReviewedAt: ts }),
  c("cn-dl-mac-vlan",     "cn-dl-mac", CN, "VLANs & Trunking",               3, { status: "not_started", confidence: null }),

  // Data Link → LLC → grandchildren
  c("cn-dl-llc-flow",  "cn-dl-llc", CN, "Flow Control (Stop-and-Wait, Sliding Window)", 0, { status: "in_progress", confidence: "weak", lastReviewedAt: ts }),
  c("cn-dl-llc-error", "cn-dl-llc", CN, "Error Detection & Correction",                   1, { status: "done", confidence: "ok", lastReviewedAt: ts }),

  // Data Link → Switching → grandchildren
  c("cn-dl-sw-simple",   "cn-dl-switching", CN, "Simple Bridges & Learning",  0, { status: "done", confidence: "strong", lastReviewedAt: ts }),
  c("cn-dl-sw-spanning", "cn-dl-switching", CN, "Spanning Tree Protocol",     1, { status: "not_started", confidence: null }),

  // Network Layer → children
  c("cn-net-addr",    "cn-network", CN, "IP Addressing",              0),
  c("cn-net-routing", "cn-network", CN, "Routing",                    1),
  c("cn-net-icmp",    "cn-network", CN, "ICMP & Diagnostics",         2, { status: "done", confidence: "ok", lastReviewedAt: ts }),
  c("cn-net-nat",     "cn-network", CN, "NAT & DHCP",                 3, { status: "in_progress", confidence: "weak", lastReviewedAt: ts }),

  // Network → IP Addressing → grandchildren (depth 3)
  c("cn-net-addr-v4",   "cn-net-addr", CN, "IPv4 Addressing",     0),
  c("cn-net-addr-v6",   "cn-net-addr", CN, "IPv6 Addressing",     1),
  c("cn-net-addr-sub",  "cn-net-addr", CN, "Subnetting",          2),

  // Network → IP → IPv4 → great-grandchildren (depth 4 — after drill-in, this is depth 1)
  c("cn-net-addr-v4-classful",  "cn-net-addr-v4", CN, "Classful Addressing",        0, { status: "done", confidence: "strong", lastReviewedAt: ts }),
  c("cn-net-addr-v4-cidr",      "cn-net-addr-v4", CN, "Classless Addressing (CIDR)",1, { status: "done", confidence: "ok", lastReviewedAt: ts }),
  c("cn-net-addr-v4-subnet",    "cn-net-addr-v4", CN, "Subnet Mask & Supernetting", 2, { status: "in_progress", confidence: "weak", lastReviewedAt: ts }),

  // Network → IP → Subnetting → great-grandchildren (depth 4)
  c("cn-net-addr-sub-calc", "cn-net-addr-sub", CN, "Subnet Calculation", 0),
  c("cn-net-addr-sub-vlsm", "cn-net-addr-sub", CN, "VLSM",              1),

  // Network → IP → Subnetting → Calculation → depth 5
  c("cn-subcalc-basic", "cn-net-addr-sub-calc", CN, "Basic Subnet Calculation",    0, { status: "done", confidence: "strong", lastReviewedAt: ts }),
  c("cn-subcalc-adv",   "cn-net-addr-sub-calc", CN, "Advanced Subnet Calculation", 1, { status: "in_progress", confidence: "weak", lastReviewedAt: ts }),

  // Network → IP → Subnetting → VLSM → depth 5
  c("cn-vlsm-basic",  "cn-net-addr-sub-vlsm", CN, "VLSM Basics",         0, { status: "in_progress", confidence: "ok", lastReviewedAt: ts }),
  c("cn-vlsm-design", "cn-net-addr-sub-vlsm", CN, "VLSM Network Design", 1, { status: "not_started", confidence: null }),

  // Network → IP → IPv6 → depth 4
  c("cn-v6-basics",     "cn-net-addr-v6", CN, "IPv6 Basics & Addressing", 0, { status: "not_started", confidence: null }),
  c("cn-v6-transition", "cn-net-addr-v6", CN, "IPv4-to-IPv6 Transition",  1, { status: "not_started", confidence: null }),

  // Network → Routing → grandchildren (depth 3)
  c("cn-net-route-static",  "cn-net-routing", CN, "Static & Default Routing", 0, { status: "done", confidence: "strong", lastReviewedAt: ts }),
  c("cn-net-route-dynamic", "cn-net-routing", CN, "Dynamic Routing Protocols", 1),
  c("cn-net-route-ospf",    "cn-net-routing", CN, "OSPF",                      2, { status: "in_progress", confidence: "weak", lastReviewedAt: ts }),
  c("cn-net-route-bgp",     "cn-net-routing", CN, "BGP",                       3, { status: "not_started", confidence: null }),

  // Network → Routing → Dynamic → depth 4
  c("cn-route-dyn-dist",  "cn-net-route-dynamic", CN, "Distance Vector (RIP)",     0, { status: "done", confidence: "strong", lastReviewedAt: ts }),
  c("cn-route-dyn-link",  "cn-net-route-dynamic", CN, "Link State (OSPF)",         1, { status: "in_progress", confidence: "ok", lastReviewedAt: ts }),
  c("cn-route-dyn-hybrid","cn-net-route-dynamic", CN, "Hybrid (EIGRP)",            2, { status: "not_started", confidence: null }),

  // Transport Layer → children
  c("cn-tran-tcp",     "cn-transport", CN, "TCP",             0),
  c("cn-tran-udp",     "cn-transport", CN, "UDP",             1, { status: "done", confidence: "strong", lastReviewedAt: ts }),
  c("cn-tran-compare", "cn-transport", CN, "TCP vs UDP",      2, { status: "in_progress", confidence: "ok", lastReviewedAt: ts }),
  c("cn-tran-sockets", "cn-transport", CN, "Socket Programming",3, { status: "not_started", confidence: null }),

  // Transport → TCP → grandchildren (depth 3)
  c("cn-tran-tcp-conn",    "cn-tran-tcp", CN, "Connection Management", 0),
  c("cn-tran-tcp-flow",    "cn-tran-tcp", CN, "Flow Control",          1),
  c("cn-tran-tcp-congest", "cn-tran-tcp", CN, "Congestion Control",    2),

  // Transport → TCP → Connection → depth 4
  c("cn-tcp-conn-handshake", "cn-tran-tcp-conn", CN, "Three-Way Handshake",    0, { status: "done", confidence: "strong", lastReviewedAt: ts }),
  c("cn-tcp-conn-term",      "cn-tran-tcp-conn", CN, "Connection Termination", 1, { status: "done", confidence: "strong", lastReviewedAt: ts }),
  c("cn-tcp-conn-state",     "cn-tran-tcp-conn", CN, "TCP State Machine",      2, { status: "in_progress", confidence: "weak", lastReviewedAt: ts }),

  // Transport → TCP → Flow Control → depth 4
  c("cn-tcp-flow-saw",     "cn-tran-tcp-flow", CN, "Stop-and-Wait ARQ",   0, { status: "done", confidence: "strong", lastReviewedAt: ts }),
  c("cn-tcp-flow-swindow", "cn-tran-tcp-flow", CN, "Sliding Window",      1, { status: "in_progress", confidence: "ok", lastReviewedAt: ts }),
  c("cn-tcp-flow-wscale",  "cn-tran-tcp-flow", CN, "Window Scaling",      2, { status: "not_started", confidence: null }),

  // Transport → TCP → Congestion Control → depth 4
  c("cn-tcp-cong-aimd",    "cn-tran-tcp-congest", CN, "AIMD",                               0, { status: "done", confidence: "strong", lastReviewedAt: ts }),
  c("cn-tcp-cong-ss",      "cn-tran-tcp-congest", CN, "Slow Start & Congestion Avoidance",  1, { status: "in_progress", confidence: "weak", lastReviewedAt: ts }),
  c("cn-tcp-cong-recovery","cn-tran-tcp-congest", CN, "Fast Retransmit & Recovery",          2, { status: "not_started", confidence: null }),

  // Application Layer → children (depth 2, all leaves)
  c("cn-app-http", "cn-application", CN, "HTTP/HTTPS", 0, { status: "done", confidence: "strong", lastReviewedAt: ts }),
  c("cn-app-dns",  "cn-application", CN, "DNS",        1, { status: "done", confidence: "ok", lastReviewedAt: ts }),
  c("cn-app-smtp", "cn-application", CN, "SMTP & POP3", 2, { status: "in_progress", confidence: "weak", lastReviewedAt: ts }),
  c("cn-app-ftp",  "cn-application", CN, "FTP & TFTP", 3, { status: "not_started", confidence: null }),
  c("cn-app-dhcp", "cn-application", CN, "DHCP",        4, { status: "in_progress", confidence: "ok", lastReviewedAt: ts }),

  // Security → children (depth 2, all leaves)
  c("cn-sec-firewall", "cn-security", CN, "Firewalls & Proxies", 0, { status: "done", confidence: "strong", lastReviewedAt: ts }),
  c("cn-sec-crypto",   "cn-security", CN, "Encryption Basics",   1, { status: "in_progress", confidence: "weak", lastReviewedAt: ts }),
  c("cn-sec-tls",      "cn-security", CN, "TLS/SSL",             2, { status: "not_started", confidence: null }),
  c("cn-sec-vpn",      "cn-security", CN, "VPNs & Tunneling",    3, { status: "not_started", confidence: null }),

  // Wireless → children (depth 2, all leaves)
  c("cn-wire-80211",    "cn-wireless", CN, "802.11 Standards",       0, { status: "done", confidence: "strong", lastReviewedAt: ts }),
  c("cn-wire-csma",     "cn-wireless", CN, "CSMA/CA",               1, { status: "done", confidence: "ok", lastReviewedAt: ts }),
  c("cn-wire-cellular", "cn-wireless", CN, "Cellular Networks (4G/5G)", 2, { status: "not_started", confidence: null }),

  // Deep Testing Hierarchy — 14 levels under Physical Layer
  c("cn-deep-l2",  "cn-physical",  CN, "Deep Test — Level 2",  10),
  c("cn-deep-l3",  "cn-deep-l2",   CN, "Deep Test — Level 3",  0),
  c("cn-deep-l4",  "cn-deep-l3",   CN, "Deep Test — Level 4",  0),
  c("cn-deep-l5",  "cn-deep-l4",   CN, "Deep Test — Level 5",  0),
  c("cn-deep-l6",  "cn-deep-l5",   CN, "Deep Test — Level 6",  0),
  c("cn-deep-l7",  "cn-deep-l6",   CN, "Deep Test — Level 7",  0),
  c("cn-deep-l8",  "cn-deep-l7",   CN, "Deep Test — Level 8",  0),
  c("cn-deep-l9",  "cn-deep-l8",   CN, "Deep Test — Level 9",  0),
  c("cn-deep-l10", "cn-deep-l9",   CN, "Deep Test — Level 10", 0),
  c("cn-deep-l11", "cn-deep-l10",  CN, "Deep Test — Level 11", 0),
  c("cn-deep-l12", "cn-deep-l11",  CN, "Deep Test — Level 12", 0),
  c("cn-deep-l13", "cn-deep-l12",  CN, "Deep Test — Level 13", 0),
  c("cn-deep-l14", "cn-deep-l13",  CN, "Deep Test — Level 14", 0),
  c("cn-deep-l14a","cn-deep-l14",  CN, "Leaf — Done & Strong",           0, { status: "done", confidence: "strong", lastReviewedAt: ts }),
  c("cn-deep-l14b","cn-deep-l14",  CN, "Leaf — In Progress & Weak",      1, { status: "in_progress", confidence: "weak", lastReviewedAt: ts }),
  c("cn-deep-l14c","cn-deep-l14",  CN, "Leaf — Not Started",             2, { status: "not_started", confidence: null }),
  c("cn-deep-l14d","cn-deep-l14",  CN, "Leaf — Done & OK",               3, { status: "done", confidence: "ok", lastReviewedAt: ts }),

  // ════════════════════════════════════════════════════════════════
  // Operating Systems — 5 levels deep
  // ════════════════════════════════════════════════════════════════
  n("os-intro",     OS, "Introduction to OS",              0),
  n("os-processes", OS, "Process Management",              1),
  n("os-threads",   OS, "Threads & Concurrency",           2),
  n("os-memory",    OS, "Memory Management",               3),
  n("os-fs",        OS, "File Systems",                    4),
  n("os-io",        OS, "I/O Management",                  5),

  c("os-intro-types",    "os-intro", OS, "Types of Operating Systems",    0, { status: "done", confidence: "strong", lastReviewedAt: ts }),
  c("os-intro-syscalls", "os-intro", OS, "System Calls",                  1, { status: "done", confidence: "ok", lastReviewedAt: ts }),
  c("os-intro-arch",     "os-intro", OS, "OS Architecture",               2, { status: "in_progress", confidence: "weak", lastReviewedAt: ts }),

  // Process Management → children
  c("os-proc-lifecycle",  "os-processes", OS, "Process Lifecycle",         0),
  c("os-proc-scheduling", "os-processes", OS, "CPU Scheduling",            1),
  c("os-proc-sync",       "os-processes", OS, "Process Synchronization",   2),
  c("os-proc-deadlock",   "os-processes", OS, "Deadlocks",                 3),

  c("os-proc-lc-states",  "os-proc-lifecycle", OS, "Process States & Transitions", 0, { status: "done", confidence: "strong", lastReviewedAt: ts }),
  c("os-proc-lc-pcb",     "os-proc-lifecycle", OS, "Process Control Block",        1, { status: "done", confidence: "ok", lastReviewedAt: ts }),
  c("os-proc-lc-ctx",     "os-proc-lifecycle", OS, "Context Switching",            2, { status: "in_progress", confidence: "weak", lastReviewedAt: ts }),

  c("os-proc-sched-fcfs",     "os-proc-scheduling", OS, "FCFS",                  0, { status: "done", confidence: "strong", lastReviewedAt: ts }),
  c("os-proc-sched-sjf",      "os-proc-scheduling", OS, "SJF & SRTF",            1, { status: "done", confidence: "strong", lastReviewedAt: ts }),
  c("os-proc-sched-rr",       "os-proc-scheduling", OS, "Round Robin",           2, { status: "done", confidence: "ok", lastReviewedAt: ts }),
  c("os-proc-sched-priority", "os-proc-scheduling", OS, "Priority Scheduling",   3, { status: "in_progress", confidence: "weak", lastReviewedAt: ts }),
  c("os-proc-sched-mlq",      "os-proc-scheduling", OS, "Multilevel Queue & Feedback", 4),

  // MLQ → depth 4
  c("os-mlq-basic",    "os-proc-sched-mlq", OS, "Multilevel Queue Basics",     0, { status: "in_progress", confidence: "ok", lastReviewedAt: ts }),
  c("os-mlq-feedback", "os-proc-sched-mlq", OS, "Multilevel Feedback Queue",   1),

  // MLQ → Feedback → depth 5
  c("os-mlq-fb-aging", "os-mlq-feedback", OS, "Aging & Priority Boost",  0, { status: "not_started", confidence: null }),
  c("os-mlq-fb-tune",  "os-mlq-feedback", OS, "Tuning MLFQ Parameters",   1, { status: "not_started", confidence: null }),

  c("os-proc-sync-critical", "os-proc-sync", OS, "Critical Section Problem",        0, { status: "done", confidence: "strong", lastReviewedAt: ts }),
  c("os-proc-sync-sem",      "os-proc-sync", OS, "Semaphores & Mutexes",            1, { status: "done", confidence: "ok", lastReviewedAt: ts }),
  c("os-proc-sync-monitor",  "os-proc-sync", OS, "Monitors & Condition Variables",  2, { status: "in_progress", confidence: "weak", lastReviewedAt: ts }),
  c("os-proc-sync-classic",  "os-proc-sync", OS, "Classic Sync Problems",           3, { status: "not_started", confidence: null }),

  c("os-proc-deadlock-cond",  "os-proc-deadlock", OS, "Deadlock Conditions",         0, { status: "done", confidence: "strong", lastReviewedAt: ts }),
  c("os-proc-deadlock-avoid", "os-proc-deadlock", OS, "Deadlock Avoidance (Banker's)",1, { status: "in_progress", confidence: "weak", lastReviewedAt: ts }),
  c("os-proc-deadlock-detect","os-proc-deadlock", OS, "Deadlock Detection & Recovery",2, { status: "not_started", confidence: null }),

  // ════════════════════════════════════════════════════════════════
  // Trees (DSA) — 4 levels deep
  // ════════════════════════════════════════════════════════════════
  n("tree-intro",     TR, "Tree Fundamentals",               0),
  n("tree-bst",       TR, "Binary Search Trees",             1),
  n("tree-avl",       TR, "AVL Trees",                       2),
  n("tree-heap",      TR, "Heaps & Priority Queues",         3),
  n("tree-trie",      TR, "Tries",                           4),
  n("tree-segment",   TR, "Segment Trees & Fenwick",         5),

  c("tree-intro-defs",      "tree-intro", TR, "Definitions & Terminology",          0, { status: "done", confidence: "strong", lastReviewedAt: ts }),
  c("tree-intro-traverse",  "tree-intro", TR, "Tree Traversals",                    1, { status: "done", confidence: "strong", lastReviewedAt: ts }),
  c("tree-intro-types",     "tree-intro", TR, "Binary Tree Types",                  2, { status: "done", confidence: "ok", lastReviewedAt: ts }),
  c("tree-intro-rep",       "tree-intro", TR, "Tree Representations",               3, { status: "in_progress", confidence: "ok", lastReviewedAt: ts }),

  c("tree-bst-ops",     "tree-bst", TR, "BST Operations (Insert, Search, Delete)",  0, { status: "done", confidence: "strong", lastReviewedAt: ts }),
  c("tree-bst-order",   "tree-bst", TR, "BST In-order Traversal",                   1, { status: "done", confidence: "strong", lastReviewedAt: ts }),
  c("tree-bst-validate","tree-bst", TR, "Validate BST",                             2, { status: "done", confidence: "ok", lastReviewedAt: ts }),
  c("tree-bst-lca",     "tree-bst", TR, "LCA in BST",                               3, { status: "in_progress", confidence: "weak", lastReviewedAt: ts }),
  c("tree-bst-balance", "tree-bst", TR, "Balance BST",                              4, { status: "not_started", confidence: null }),

  // AVL → children
  c("tree-avl-rotations", "tree-avl", TR, "AVL Rotations",    0),
  c("tree-avl-insert",    "tree-avl", TR, "AVL Insertion",    1),
  c("tree-avl-delete",    "tree-avl", TR, "AVL Deletion",     2),

  // AVL → Rotations → leaves (depth 3)
  c("tree-avl-rot-ll", "tree-avl-rotations", TR, "LL Rotation (Right Rotate)",  0, { status: "done", confidence: "strong", lastReviewedAt: ts }),
  c("tree-avl-rot-rr", "tree-avl-rotations", TR, "RR Rotation (Left Rotate)",  1, { status: "done", confidence: "strong", lastReviewedAt: ts }),
  c("tree-avl-rot-lr", "tree-avl-rotations", TR, "LR Rotation (Left-Right)",   2, { status: "in_progress", confidence: "weak", lastReviewedAt: ts }),
  c("tree-avl-rot-rl", "tree-avl-rotations", TR, "RL Rotation (Right-Left)",   3, { status: "in_progress", confidence: "weak", lastReviewedAt: ts }),

  c("tree-avl-ins-basic",   "tree-avl-insert", TR, "AVL Insertion Steps",        0, { status: "done", confidence: "ok", lastReviewedAt: ts }),
  c("tree-avl-ins-complex", "tree-avl-insert", TR, "Complex Insertion Cases",    1, { status: "not_started", confidence: null }),

  c("tree-avl-del-basic",   "tree-avl-delete", TR, "AVL Deletion Steps",         0, { status: "not_started", confidence: null }),
  c("tree-avl-del-complex", "tree-avl-delete", TR, "Complex Deletion Cases",     1, { status: "not_started", confidence: null }),

  // ════════════════════════════════════════════════════════════════
  // Dynamic Programming — 4 levels deep
  // ════════════════════════════════════════════════════════════════
  n("dp-intro",     DP, "DP Fundamentals",          0),
  n("dp-1d",        DP, "1D DP",                    1),
  n("dp-2d",        DP, "2D DP",                    2),
  n("dp-knapsack",  DP, "Knapsack & Subset Problems",3),
  n("dp-lcs",       DP, "LCS & String DP",          4),
  n("dp-intervals", DP, "Interval DP",              5),

  c("dp-intro-what",     "dp-intro", DP, "What is DP?",                   0, { status: "done", confidence: "strong", lastReviewedAt: ts }),
  c("dp-intro-memo",     "dp-intro", DP, "Memoization vs Tabulation",     1, { status: "done", confidence: "strong", lastReviewedAt: ts }),
  c("dp-intro-optimal",  "dp-intro", DP, "Optimal Substructure",          2, { status: "done", confidence: "ok", lastReviewedAt: ts }),
  c("dp-intro-overlap",  "dp-intro", DP, "Overlapping Subproblems",       3, { status: "in_progress", confidence: "ok", lastReviewedAt: ts }),

  c("dp-1d-fibo",    "dp-1d", DP, "Fibonacci (Memo & Tabulation)",  0, { status: "done", confidence: "strong", lastReviewedAt: ts }),
  c("dp-1d-climb",   "dp-1d", DP, "Climbing Stairs",                1, { status: "done", confidence: "strong", lastReviewedAt: ts }),
  c("dp-1d-rob",     "dp-1d", DP, "House Robber",                   2, { status: "done", confidence: "ok", lastReviewedAt: ts }),
  c("dp-1d-lis",     "dp-1d", DP, "Longest Increasing Subsequence", 3),
  c("dp-1d-coins",   "dp-1d", DP, "Coin Change",                    4),

  // 1D DP → LIS → deeper
  c("dp-lis-basic", "dp-1d-lis", DP, "LIS O(n²) DP",   0, { status: "done", confidence: "strong", lastReviewedAt: ts }),
  c("dp-lis-optim", "dp-1d-lis", DP, "LIS O(n log n) with Binary Search", 1),
  c("dp-lis-opt-patience", "dp-1d-lis-optim", DP, "Patience Sorting", 0, { status: "in_progress", confidence: "weak", lastReviewedAt: ts }),
  c("dp-lis-opt-print",    "dp-1d-lis-optim", DP, "Printing LIS",     1, { status: "not_started", confidence: null }),

  // 1D DP → Coin Change → deeper
  c("dp-coins-basic", "dp-1d-coins", DP, "Coin Change (Min Coins)",  0, { status: "done", confidence: "ok", lastReviewedAt: ts }),
  c("dp-coins-ways",  "dp-1d-coins", DP, "Coin Change 2 (Ways)",     1, { status: "in_progress", confidence: "weak", lastReviewedAt: ts }),

  // ════════════════════════════════════════════════════════════════
  // Arrays & Hashing — 3 levels deep (shallow, many siblings)
  // ════════════════════════════════════════════════════════════════
  n("arr-intro",   AR, "Array Fundamentals",    0),
  n("arr-two",     AR, "Two Pointers",           1),
  n("arr-sliding", AR, "Sliding Window",         2),
  n("arr-hash",    AR, "Hashing & Hash Maps",    3),
  n("arr-prefix",  AR, "Prefix Sums",            4),

  c("arr-intro-ops",    "arr-intro", AR, "Array Operations & Traversal", 0, { status: "done", confidence: "strong", lastReviewedAt: ts }),
  c("arr-intro-reverse","arr-intro", AR, "In-place Reversal",           1, { status: "done", confidence: "strong", lastReviewedAt: ts }),
  c("arr-intro-rotate", "arr-intro", AR, "Array Rotation",              2, { status: "in_progress", confidence: "ok", lastReviewedAt: ts }),
  c("arr-intro-partition","arr-intro", AR, "Partitioning Arrays",        3, { status: "not_started", confidence: null }),

  c("arr-two-pair",   "arr-two", AR, "Two Sum (Sorted)",          0, { status: "done", confidence: "strong", lastReviewedAt: ts }),
  c("arr-two-three",  "arr-two", AR, "Three Sum",                 1, { status: "done", confidence: "ok", lastReviewedAt: ts }),
  c("arr-two-water",  "arr-two", AR, "Container with Most Water", 2, { status: "in_progress", confidence: "ok", lastReviewedAt: ts }),
  c("arr-two-trapping","arr-two", AR, "Trapping Rain Water",       3, { status: "not_started", confidence: null }),

  c("arr-sliding-fixed",  "arr-sliding", AR, "Fixed Window (Max Sum Subarray)", 0, { status: "done", confidence: "strong", lastReviewedAt: ts }),
  c("arr-sliding-variable","arr-sliding", AR, "Variable Window (Longest Substring)", 1, { status: "in_progress", confidence: "weak", lastReviewedAt: ts }),
  c("arr-sliding-min",    "arr-sliding", AR, "Minimum Window Substring",         2, { status: "not_started", confidence: null }),

  c("arr-hash-intro",  "arr-hash", AR, "Hash Map Fundamentals",   0, { status: "done", confidence: "strong", lastReviewedAt: ts }),
  c("arr-hash-counts", "arr-hash", AR, "Frequency Counting",      1, { status: "done", confidence: "ok", lastReviewedAt: ts }),
  c("arr-hash-valid",  "arr-hash", AR, "Valid Anagram",           2, { status: "done", confidence: "strong", lastReviewedAt: ts }),
  c("arr-hash-group",  "arr-hash", AR, "Group Anagrams",          3, { status: "not_started", confidence: null }),

  c("arr-prefix-basic",      "arr-prefix", AR, "Prefix Sum Basics",           0, { status: "done", confidence: "strong", lastReviewedAt: ts }),
  c("arr-prefix-subarray",   "arr-prefix", AR, "Subarray Sum Equals K",       1, { status: "in_progress", confidence: "ok", lastReviewedAt: ts }),
  c("arr-prefix-diff",       "arr-prefix", AR, "Difference Arrays",           2, { status: "not_started", confidence: null }),

  // ════════════════════════════════════════════════════════════════
  // System Design — 4 levels deep
  // ════════════════════════════════════════════════════════════════
  n("sd-intro",     SD, "System Design Fundamentals",  0),
  n("sd-arch",      SD, "Architectural Patterns",      1),
  n("sd-db",        SD, "Database Design",             2),
  n("sd-dist",      SD, "Distributed Systems",         3),
  n("sd-case",      SD, "Case Studies",                4),

  c("sd-intro-what",       "sd-intro", SD, "What is System Design?",      0, { status: "done", confidence: "strong", lastReviewedAt: ts }),
  c("sd-intro-load",       "sd-intro", SD, "Load Balancing",              1, { status: "done", confidence: "ok", lastReviewedAt: ts }),
  c("sd-intro-caching",    "sd-intro", SD, "Caching Strategies",          2, { status: "in_progress", confidence: "weak", lastReviewedAt: ts }),
  c("sd-intro-proxy",      "sd-intro", SD, "Proxies & CDNs",              3, { status: "not_started", confidence: null }),

  c("sd-arch-monolith", "sd-arch", SD, "Monolithic vs Microservices", 0, { status: "done", confidence: "strong", lastReviewedAt: ts }),
  c("sd-arch-soa",      "sd-arch", SD, "Service-Oriented Architecture",1, { status: "in_progress", confidence: "ok", lastReviewedAt: ts }),
  c("sd-arch-events",   "sd-arch", SD, "Event-Driven Architecture",    2),
  c("sd-arch-cqrs",     "sd-arch", SD, "CQRS & Event Sourcing",        3),

  c("sd-arch-events-pubsub", "sd-arch-events", SD, "Pub/Sub Systems",     0, { status: "in_progress", confidence: "ok", lastReviewedAt: ts }),
  c("sd-arch-events-stream", "sd-arch-events", SD, "Event Streams (Kafka)",1, { status: "not_started", confidence: null }),

  c("sd-db-sql",       "sd-db", SD, "SQL Databases (Normalization)",   0, { status: "done", confidence: "strong", lastReviewedAt: ts }),
  c("sd-db-nosql",     "sd-db", SD, "NoSQL Databases",                 1, { status: "in_progress", confidence: "ok", lastReviewedAt: ts }),
  c("sd-db-sharding",  "sd-db", SD, "Sharding & Partitioning",         2, { status: "not_started", confidence: null }),
  c("sd-db-replication","sd-db", SD, "Replication & Consistency",      3),

  c("sd-db-repl-sync",  "sd-db-replication", SD, "Synchronous Replication", 0, { status: "done", confidence: "ok", lastReviewedAt: ts }),
  c("sd-db-repl-async", "sd-db-replication", SD, "Asynchronous Replication",1, { status: "in_progress", confidence: "weak", lastReviewedAt: ts }),
  c("sd-db-repl-consensus","sd-db-replication", SD, "Consensus (Paxos/Raft)",2, { status: "not_started", confidence: null }),

  c("sd-dist-cap",    "sd-dist", SD, "CAP Theorem",                   0, { status: "done", confidence: "strong", lastReviewedAt: ts }),
  c("sd-dist-consist","sd-dist", SD, "Consistency Models",            1, { status: "in_progress", confidence: "weak", lastReviewedAt: ts }),
  c("sd-dist-gossip", "sd-dist", SD, "Gossip Protocols",              2, { status: "not_started", confidence: null }),
  c("sd-dist-id",     "sd-dist", SD, "Distributed ID Generation",     3, { status: "not_started", confidence: null }),

  c("sd-case-url",     "sd-case", SD, "URL Shortener (TinyURL)",    0, { status: "done", confidence: "strong", lastReviewedAt: ts }),
  c("sd-case-chat",    "sd-case", SD, "Chat System (WhatsApp)",      1, { status: "in_progress", confidence: "ok", lastReviewedAt: ts }),
  c("sd-case-twitter", "sd-case", SD, "Social Media Feed",           2, { status: "not_started", confidence: null }),
  c("sd-case-youtube", "sd-case", SD, "Video Streaming Platform",   3, { status: "not_started", confidence: null }),
];

function deriveSeedActivityLogs(nodes: NodeStoreItem[]): NodeActivityEntry[] {
  const logs: NodeActivityEntry[] = [];
  for (const node of nodes) {
    logs.push({
      id: generateId(),
      nodeId: node.id,
      workspaceId: node.workspaceId,
      action: "created",
      timestamp: node.createdAt,
    });
    if (node.lastReviewedAt) {
      const action: NodeActivityAction =
        node.status === "done" ? "marked_done"
        : node.status === "in_progress" ? "marked_in_progress"
        : node.status === "not_started" ? "marked_not_started"
        : "reviewed";
      logs.push({
        id: generateId(),
        nodeId: node.id,
        workspaceId: node.workspaceId,
        action,
        timestamp: node.lastReviewedAt,
      });
    }
  }
  return logs;
}

export const useNodeStore = create<NodeStore>((set, get) => ({
  nodes: SEED_NODES,
  activityLogs: deriveSeedActivityLogs(SEED_NODES),
  hydrated: true,

  addNode: (input) => {
    const siblings = get().nodes.filter(
      (n) => n.parentId === (input.parentId ?? null) && n.workspaceId === input.workspaceId,
    );
    const orderIndex = siblings.length;
    const node = createNodeStoreItem(input, orderIndex);
    const now = new Date().toISOString();
    const log: NodeActivityEntry = {
      id: generateId(),
      nodeId: node.id,
      workspaceId: node.workspaceId,
      action: "created",
      timestamp: now,
    };
    set((state) => ({
      nodes: [...state.nodes, node],
      activityLogs: [...state.activityLogs, log],
    }));
    return node.id;
  },

  updateNode: (id, input) => {
    set((state) => {
      const existing = state.nodes.find((n) => n.id === id);
      if (!existing) return state;

      const now = new Date().toISOString();
      const logs: NodeActivityEntry[] = [];

      if (input.status !== undefined && input.status !== existing.status) {
        const action: NodeActivityAction =
          input.status === "done" ? "marked_done"
          : input.status === "in_progress" ? "marked_in_progress"
          : "marked_not_started";
        logs.push({
          id: generateId(),
          nodeId: id,
          workspaceId: existing.workspaceId,
          action,
          timestamp: now,
        });
      }
      if (input.confidence !== undefined && input.confidence !== existing.confidence) {
        logs.push({
          id: generateId(),
          nodeId: id,
          workspaceId: existing.workspaceId,
          action: "confidence_changed",
          timestamp: now,
        });
      }

      return {
        nodes: state.nodes.map((n) => (n.id === id ? updateNodeStoreItem(n, input) : n)),
        activityLogs: [...state.activityLogs, ...logs],
      };
    });
  },

  removeNode: (id) => {
    set((state) => {
      const idsToRemove = new Set<string>();
      function collectDescendants(nodeId: string) {
        idsToRemove.add(nodeId);
        state.nodes.filter((n) => n.parentId === nodeId).forEach((child) => collectDescendants(child.id));
      }
      collectDescendants(id);
      return { nodes: state.nodes.filter((n) => !idsToRemove.has(n.id)) };
    });
  },

  reorderSiblings: (parentId, workspaceId, orderedIds) => {
    set((state) => {
      const reorderIndex = new Map<string, number>();
      orderedIds.forEach((id, i) => reorderIndex.set(id, i));

      const reordered = new Set(orderedIds);

      const intermediate = state.nodes.map((node) => {
        if (node.workspaceId !== workspaceId) return node;
        const newOrder = reorderIndex.get(node.id);
        if (newOrder !== undefined) {
          return { ...node, parentId, orderIndex: newOrder };
        }
        return node;
      });

      const parentBuckets = new Map<string | null, Array<{ id: string; orderIndex: number }>>();
      for (const node of intermediate) {
        if (node.workspaceId !== workspaceId) continue;
        if (reordered.has(node.id)) continue;
        const key = node.parentId;
        if (!parentBuckets.has(key)) parentBuckets.set(key, []);
        parentBuckets.get(key)!.push({ id: node.id, orderIndex: node.orderIndex });
      }

      for (const [, siblings] of parentBuckets) {
        siblings.sort((a, b) => a.orderIndex - b.orderIndex);
      }

      const compactIndex = new Map<string, number>();
      for (const [, siblings] of parentBuckets) {
        for (let i = 0; i < siblings.length; i++) {
          compactIndex.set(siblings[i].id, i);
        }
      }

      return {
        nodes: intermediate.map((node) => {
          if (node.workspaceId !== workspaceId) return node;
          if (reordered.has(node.id)) return node;
          const compact = compactIndex.get(node.id);
          if (compact !== undefined && compact !== node.orderIndex) {
            return { ...node, orderIndex: compact };
          }
          return node;
        }),
      };
    });
  },

  getWorkspaceNodes: (workspaceId) => {
    return get().nodes.filter((n) => n.workspaceId === workspaceId);
  },

  getWorkspaceActivityLogs: (workspaceId) => {
    return get().activityLogs.filter((l) => l.workspaceId === workspaceId);
  },
}));
