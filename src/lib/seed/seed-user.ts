import type { PrismaClient, NodeStatus, NodeConfidence } from "@/generated/prisma/client";
import type { NodeActivityAction } from "@/types/node";

const SEED_GROUPS = [
  { id: "seed-group-core", name: "Core CS", orderIndex: 0 },
  { id: "seed-group-dsa", name: "DSA & Problem Solving", orderIndex: 1 },
  { id: "seed-group-interview", name: "Interview Prep", orderIndex: 2 },
];

const SEED_WORKSPACES = [
  { id: "seed-ws-cn", name: "Computer Networks", groupId: "seed-group-core", orderIndex: 0 },
  { id: "seed-ws-os", name: "Operating Systems", groupId: "seed-group-core", orderIndex: 1 },
  { id: "seed-ws-db", name: "Database Systems", groupId: "seed-group-core", orderIndex: 2 },
  { id: "seed-ws-ca", name: "Computer Architecture", groupId: "seed-group-core", orderIndex: 3 },
  { id: "seed-ws-cd", name: "Compiler Design", groupId: "seed-group-core", orderIndex: 4 },
  { id: "seed-ws-toc", name: "Theory of Computation", groupId: "seed-group-core", orderIndex: 5 },
  { id: "seed-ws-arrays", name: "Arrays & Hashing", groupId: "seed-group-dsa", orderIndex: 0 },
  { id: "seed-ws-pointers", name: "Two Pointers", groupId: "seed-group-dsa", orderIndex: 1 },
  { id: "seed-ws-sliding", name: "Sliding Window", groupId: "seed-group-dsa", orderIndex: 2 },
  { id: "seed-ws-stack", name: "Stack", groupId: "seed-group-dsa", orderIndex: 3 },
  { id: "seed-ws-bs", name: "Binary Search", groupId: "seed-group-dsa", orderIndex: 4 },
  { id: "seed-ws-ll", name: "Linked List", groupId: "seed-group-dsa", orderIndex: 5 },
  { id: "seed-ws-trees", name: "Trees", groupId: "seed-group-dsa", orderIndex: 6 },
  { id: "seed-ws-graphs", name: "Graphs", groupId: "seed-group-dsa", orderIndex: 7 },
  { id: "seed-ws-dp", name: "Dynamic Programming", groupId: "seed-group-dsa", orderIndex: 8 },
  { id: "seed-ws-greedy", name: "Greedy", groupId: "seed-group-dsa", orderIndex: 9 },
  { id: "seed-ws-backtrack", name: "Backtracking", groupId: "seed-group-dsa", orderIndex: 10 },
  { id: "seed-ws-tries", name: "Tries", groupId: "seed-group-dsa", orderIndex: 11 },
  { id: "seed-ws-intervals", name: "Intervals", groupId: "seed-group-dsa", orderIndex: 12 },
  { id: "seed-ws-math", name: "Math & Geometry", groupId: "seed-group-dsa", orderIndex: 13 },
  { id: "seed-ws-bits", name: "Bit Manipulation", groupId: "seed-group-dsa", orderIndex: 14 },
  { id: "seed-ws-sd", name: "System Design", groupId: "seed-group-interview", orderIndex: 0 },
  { id: "seed-ws-lld", name: "Low-Level Design", groupId: "seed-group-interview", orderIndex: 1 },
  { id: "seed-ws-sql", name: "SQL & Database Design", groupId: "seed-group-interview", orderIndex: 2 },
  { id: "seed-ws-behavioral", name: "Behavioral Prep", groupId: "seed-group-interview", orderIndex: 3 },
  { id: "seed-ws-ml", name: "Machine Learning", groupId: null, orderIndex: 0 },
  { id: "seed-ws-dist", name: "Distributed Systems", groupId: null, orderIndex: 1 },
  { id: "seed-ws-sec", name: "Cybersecurity", groupId: null, orderIndex: 2 },
  { id: "seed-ws-web", name: "Web Development", groupId: null, orderIndex: 3 },
  { id: "seed-ws-cg", name: "Computer Graphics", groupId: null, orderIndex: 4 },
];

type SeedNodeInput = {
  id: string;
  workspaceId: string;
  parentId: string | null;
  title: string;
  orderIndex: number;
  status: NodeStatus | null;
  confidence: NodeConfidence | null;
  notes: string;
  lastReviewedAt: string | null;
  createdAt: string;
};

const SPREAD_START = new Date("2026-04-01");
const SPREAD_END = new Date("2026-06-28");
const SPREAD_DAYS = Math.max(1, Math.round((SPREAD_END.getTime() - SPREAD_START.getTime()) / 86_400_000));

function deriveSeedActivityLogs(nodes: SeedNodeInput[]): Array<{
  id: string;
  nodeId: string;
  workspaceId: string;
  action: string;
  timestamp: Date;
  userId: string;
}> {
  const logs: Array<{
    id: string;
    nodeId: string;
    workspaceId: string;
    action: string;
    timestamp: Date;
    userId: string;
  }> = [];

  const doneNodes = nodes
    .filter((n) => n.status === "done" && n.lastReviewedAt)
    .sort((a, b) => a.id.localeCompare(b.id));
  const doneCount = doneNodes.length;

  for (const node of nodes) {
    logs.push({
      id: require("crypto").randomUUID(),
      nodeId: node.id,
      workspaceId: node.workspaceId,
      action: "created",
      timestamp: new Date(node.createdAt),
      userId: "",
    });

    if (!node.lastReviewedAt || !node.status) continue;

    if (node.status === "done") {
      const idx = doneNodes.indexOf(node);
      const offset = Math.round(doneCount > 1 ? (idx / (doneCount - 1)) * SPREAD_DAYS : 0);
      const ts = new Date(SPREAD_START);
      ts.setDate(ts.getDate() + offset);
      logs.push({
        id: require("crypto").randomUUID(),
        nodeId: node.id,
        workspaceId: node.workspaceId,
        action: "marked_done",
        timestamp: ts,
        userId: "",
      });
    } else {
      const action: NodeActivityAction =
        node.status === "in_progress" ? "marked_in_progress" : "marked_not_started";
      logs.push({
        id: require("crypto").randomUUID(),
        nodeId: node.id,
        workspaceId: node.workspaceId,
        action,
        timestamp: new Date(node.lastReviewedAt),
        userId: "",
      });
    }
  }
  return logs;
}

function buildSeedNodes(): SeedNodeInput[] {
  function n(
    id: string,
    workspaceId: string,
    title: string,
    orderIndex: number,
    overrides?: Partial<Omit<SeedNodeInput, "id" | "workspaceId" | "title" | "orderIndex">>,
  ): SeedNodeInput {
    return {
      id,
      workspaceId,
      parentId: null,
      title,
      orderIndex,
      status: null,
      confidence: null,
      notes: "",
      lastReviewedAt: null,
      createdAt: "2026-01-01T00:00:00.000Z",
      ...overrides,
    };
  }

  function c(
    id: string,
    parentId: string,
    workspaceId: string,
    title: string,
    orderIndex: number,
    overrides?: Partial<Omit<SeedNodeInput, "id" | "parentId" | "workspaceId" | "title" | "orderIndex">>,
  ): SeedNodeInput {
    return { ...n(id, workspaceId, title, orderIndex, overrides), parentId };
  }

  const CN = "seed-ws-cn";
  const OS = "seed-ws-os";
  const TR = "seed-ws-trees";
  const DP = "seed-ws-dp";
  const AR = "seed-ws-arrays";
  const SD = "seed-ws-sd";
  const ts = "2026-06-28T10:00:00.000Z";

  return [
    n("cn-intro",       CN, "Introduction",                              0),
    n("cn-physical",    CN, "Physical Layer",                            1),
    n("cn-datalink",    CN, "Data Link Layer",                           2),
    n("cn-network",     CN, "Network Layer",                             3),
    n("cn-transport",   CN, "Transport Layer",                           4),
    n("cn-application", CN, "Application Layer",                         5),
    n("cn-security",    CN, "Network Security",                          6),
    n("cn-wireless",    CN, "Wireless & Mobile Networks",               7),

    c("cn-intro-osi",       "cn-intro", CN, "OSI Reference Model",               0),
    c("cn-intro-tcpip",     "cn-intro", CN, "TCP/IP Model",                      1),
    c("cn-intro-topo",      "cn-intro", CN, "Network Topologies",                2),
    c("cn-intro-tx",        "cn-intro", CN, "Data Transmission Basics",          3),

    c("cn-intro-osi-layers", "cn-intro-osi", CN, "The 7 Layers Overview",       0, { status: "done", confidence: "strong", lastReviewedAt: ts }),
    c("cn-intro-osi-vtcp",   "cn-intro-osi", CN, "OSI vs TCP/IP Comparison",    1, { status: "done", confidence: "strong", lastReviewedAt: ts }),
    c("cn-intro-osi-encap",  "cn-intro-osi", CN, "Encapsulation & Decapsulation",2, { status: "in_progress", confidence: "ok", lastReviewedAt: ts }),

    c("cn-intro-tcpip-layers",   "cn-intro-tcpip", CN, "TCP/IP Layer Functions",        0, { status: "in_progress", confidence: "ok", lastReviewedAt: ts }),
    c("cn-intro-tcpip-proto",    "cn-intro-tcpip", CN, "Key Protocols Overview",        1, { status: "not_started", confidence: null }),

    c("cn-intro-topo-star", "cn-intro-topo", CN, "Star Topology",           0, { status: "done", confidence: "strong", lastReviewedAt: ts }),
    c("cn-intro-topo-mesh", "cn-intro-topo", CN, "Mesh & Bus Topologies",  1, { status: "done", confidence: "ok", lastReviewedAt: ts }),
    c("cn-intro-topo-ring", "cn-intro-topo", CN, "Ring & Hybrid Topologies",2, { status: "not_started", confidence: null }),

    c("cn-intro-tx-simplex", "cn-intro-tx", CN, "Simplex / Half-Duplex / Full-Duplex", 0, { status: "done", confidence: "ok", lastReviewedAt: ts }),
    c("cn-intro-tx-sync",    "cn-intro-tx", CN, "Synchronous vs Asynchronous",          1, { status: "not_started", confidence: null }),

    c("cn-phy-signaling",   "cn-physical", CN, "Signaling",                0),
    c("cn-phy-media",       "cn-physical", CN, "Transmission Media",       1),
    c("cn-phy-modulation",  "cn-physical", CN, "Modulation Techniques",    2),

    c("cn-phy-sig-analog",    "cn-phy-signaling", CN, "Analog vs Digital Signals",      0, { status: "done", confidence: "strong", lastReviewedAt: ts }),
    c("cn-phy-sig-encoding",  "cn-phy-signaling", CN, "Line Encoding Schemes",          1, { status: "in_progress", confidence: "weak", lastReviewedAt: ts }),
    c("cn-phy-sig-mux",       "cn-phy-signaling", CN, "Multiplexing (FDM/TDM/WDM)",    2, { status: "not_started", confidence: null }),

    c("cn-phy-media-guided",   "cn-phy-media", CN, "Guided Media (Coaxial, Fiber, TP)",       0, { status: "done", confidence: "strong", lastReviewedAt: ts }),
    c("cn-phy-media-unguided", "cn-phy-media", CN, "Unguided Media (Radio, Microwave)",       1, { status: "in_progress", confidence: "ok", lastReviewedAt: ts }),

    c("cn-phy-mod-am",  "cn-phy-modulation", CN, "Amplitude Modulation",   0, { status: "done", confidence: "strong", lastReviewedAt: ts }),
    c("cn-phy-mod-fm",  "cn-phy-modulation", CN, "Frequency Modulation",  1, { status: "done", confidence: "ok", lastReviewedAt: ts }),
    c("cn-phy-mod-pcm", "cn-phy-modulation", CN, "Pulse Code Modulation", 2, { status: "not_started", confidence: null }),

    c("cn-dl-mac",       "cn-datalink", CN, "MAC Sublayer",           0),
    c("cn-dl-llc",       "cn-datalink", CN, "LLC Sublayer",           1),
    c("cn-dl-switching", "cn-datalink", CN, "Switching & Bridging",   2),

    c("cn-dl-mac-eth",      "cn-dl-mac", CN, "Ethernet Frame Structure",       0, { status: "done", confidence: "strong", lastReviewedAt: ts }),
    c("cn-dl-mac-csmacd",   "cn-dl-mac", CN, "CSMA/CD & CSMA/CA",             1, { status: "in_progress", confidence: "weak", lastReviewedAt: ts }),
    c("cn-dl-mac-addr",     "cn-dl-mac", CN, "MAC Addressing & ARP",           2, { status: "done", confidence: "ok", lastReviewedAt: ts }),
    c("cn-dl-mac-vlan",     "cn-dl-mac", CN, "VLANs & Trunking",               3, { status: "not_started", confidence: null }),

    c("cn-dl-llc-flow",  "cn-dl-llc", CN, "Flow Control (Stop-and-Wait, Sliding Window)", 0, { status: "in_progress", confidence: "weak", lastReviewedAt: ts }),
    c("cn-dl-llc-error", "cn-dl-llc", CN, "Error Detection & Correction",                   1, { status: "done", confidence: "ok", lastReviewedAt: ts }),

    c("cn-dl-sw-simple",   "cn-dl-switching", CN, "Simple Bridges & Learning",  0, { status: "done", confidence: "strong", lastReviewedAt: ts }),
    c("cn-dl-sw-spanning", "cn-dl-switching", CN, "Spanning Tree Protocol",     1, { status: "not_started", confidence: null }),

    c("cn-net-addr",    "cn-network", CN, "IP Addressing",              0),
    c("cn-net-routing", "cn-network", CN, "Routing",                    1),
    c("cn-net-icmp",    "cn-network", CN, "ICMP & Diagnostics",         2, { status: "done", confidence: "ok", lastReviewedAt: ts }),
    c("cn-net-nat",     "cn-network", CN, "NAT & DHCP",                 3, { status: "in_progress", confidence: "weak", lastReviewedAt: ts }),

    c("cn-net-addr-v4",   "cn-net-addr", CN, "IPv4 Addressing",     0),
    c("cn-net-addr-v6",   "cn-net-addr", CN, "IPv6 Addressing",     1),
    c("cn-net-addr-sub",  "cn-net-addr", CN, "Subnetting",          2),

    c("cn-net-addr-v4-classful",  "cn-net-addr-v4", CN, "Classful Addressing",        0, { status: "done", confidence: "strong", lastReviewedAt: ts }),
    c("cn-net-addr-v4-cidr",      "cn-net-addr-v4", CN, "Classless Addressing (CIDR)",1, { status: "done", confidence: "ok", lastReviewedAt: ts }),
    c("cn-net-addr-v4-subnet",    "cn-net-addr-v4", CN, "Subnet Mask & Supernetting", 2, { status: "in_progress", confidence: "weak", lastReviewedAt: ts }),

    c("cn-net-addr-sub-calc", "cn-net-addr-sub", CN, "Subnet Calculation", 0),
    c("cn-net-addr-sub-vlsm", "cn-net-addr-sub", CN, "VLSM",              1),

    c("cn-subcalc-basic", "cn-net-addr-sub-calc", CN, "Basic Subnet Calculation",    0, { status: "done", confidence: "strong", lastReviewedAt: ts }),
    c("cn-subcalc-adv",   "cn-net-addr-sub-calc", CN, "Advanced Subnet Calculation", 1, { status: "in_progress", confidence: "weak", lastReviewedAt: ts }),

    c("cn-vlsm-basic",  "cn-net-addr-sub-vlsm", CN, "VLSM Basics",         0, { status: "in_progress", confidence: "ok", lastReviewedAt: ts }),
    c("cn-vlsm-design", "cn-net-addr-sub-vlsm", CN, "VLSM Network Design", 1, { status: "not_started", confidence: null }),

    c("cn-v6-basics",     "cn-net-addr-v6", CN, "IPv6 Basics & Addressing", 0, { status: "not_started", confidence: null }),
    c("cn-v6-transition", "cn-net-addr-v6", CN, "IPv4-to-IPv6 Transition",  1, { status: "not_started", confidence: null }),

    c("cn-net-route-static",  "cn-net-routing", CN, "Static & Default Routing", 0, { status: "done", confidence: "strong", lastReviewedAt: ts }),
    c("cn-net-route-dynamic", "cn-net-routing", CN, "Dynamic Routing Protocols", 1),
    c("cn-net-route-ospf",    "cn-net-routing", CN, "OSPF",                      2, { status: "in_progress", confidence: "weak", lastReviewedAt: ts }),
    c("cn-net-route-bgp",     "cn-net-routing", CN, "BGP",                       3, { status: "not_started", confidence: null }),

    c("cn-route-dyn-dist",  "cn-net-route-dynamic", CN, "Distance Vector (RIP)",     0, { status: "done", confidence: "strong", lastReviewedAt: ts }),
    c("cn-route-dyn-link",  "cn-net-route-dynamic", CN, "Link State (OSPF)",         1, { status: "in_progress", confidence: "ok", lastReviewedAt: ts }),
    c("cn-route-dyn-hybrid","cn-net-route-dynamic", CN, "Hybrid (EIGRP)",            2, { status: "not_started", confidence: null }),

    c("cn-tran-tcp",     "cn-transport", CN, "TCP",             0),
    c("cn-tran-udp",     "cn-transport", CN, "UDP",             1, { status: "done", confidence: "strong", lastReviewedAt: ts }),
    c("cn-tran-compare", "cn-transport", CN, "TCP vs UDP",      2, { status: "in_progress", confidence: "ok", lastReviewedAt: ts }),
    c("cn-tran-sockets", "cn-transport", CN, "Socket Programming",3, { status: "not_started", confidence: null }),

    c("cn-tran-tcp-conn",    "cn-tran-tcp", CN, "Connection Management", 0),
    c("cn-tran-tcp-flow",    "cn-tran-tcp", CN, "Flow Control",          1),
    c("cn-tran-tcp-congest", "cn-tran-tcp", CN, "Congestion Control",    2),

    c("cn-tcp-conn-handshake", "cn-tran-tcp-conn", CN, "Three-Way Handshake",    0, { status: "done", confidence: "strong", lastReviewedAt: ts }),
    c("cn-tcp-conn-term",      "cn-tran-tcp-conn", CN, "Connection Termination", 1, { status: "done", confidence: "strong", lastReviewedAt: ts }),
    c("cn-tcp-conn-state",     "cn-tran-tcp-conn", CN, "TCP State Machine",      2, { status: "in_progress", confidence: "weak", lastReviewedAt: ts }),

    c("cn-tcp-flow-saw",     "cn-tran-tcp-flow", CN, "Stop-and-Wait ARQ",   0, { status: "done", confidence: "strong", lastReviewedAt: ts }),
    c("cn-tcp-flow-swindow", "cn-tran-tcp-flow", CN, "Sliding Window",      1, { status: "in_progress", confidence: "ok", lastReviewedAt: ts }),
    c("cn-tcp-flow-wscale",  "cn-tran-tcp-flow", CN, "Window Scaling",      2, { status: "not_started", confidence: null }),

    c("cn-tcp-cong-aimd",    "cn-tran-tcp-congest", CN, "AIMD",                               0, { status: "done", confidence: "strong", lastReviewedAt: ts }),
    c("cn-tcp-cong-ss",      "cn-tran-tcp-congest", CN, "Slow Start & Congestion Avoidance",  1, { status: "in_progress", confidence: "weak", lastReviewedAt: ts }),
    c("cn-tcp-cong-recovery","cn-tran-tcp-congest", CN, "Fast Retransmit & Recovery",          2, { status: "not_started", confidence: null }),

    c("cn-app-http", "cn-application", CN, "HTTP/HTTPS", 0, { status: "done", confidence: "strong", lastReviewedAt: ts }),
    c("cn-app-dns",  "cn-application", CN, "DNS",        1, { status: "done", confidence: "ok", lastReviewedAt: ts }),
    c("cn-app-smtp", "cn-application", CN, "SMTP & POP3", 2, { status: "in_progress", confidence: "weak", lastReviewedAt: ts }),
    c("cn-app-ftp",  "cn-application", CN, "FTP & TFTP", 3, { status: "not_started", confidence: null }),
    c("cn-app-dhcp", "cn-application", CN, "DHCP",        4, { status: "in_progress", confidence: "ok", lastReviewedAt: ts }),

    c("cn-sec-firewall", "cn-security", CN, "Firewalls & Proxies", 0, { status: "done", confidence: "strong", lastReviewedAt: ts }),
    c("cn-sec-crypto",   "cn-security", CN, "Encryption Basics",   1, { status: "in_progress", confidence: "weak", lastReviewedAt: ts }),
    c("cn-sec-tls",      "cn-security", CN, "TLS/SSL",             2, { status: "not_started", confidence: null }),
    c("cn-sec-vpn",      "cn-security", CN, "VPNs & Tunneling",    3, { status: "not_started", confidence: null }),

    c("cn-wire-80211",    "cn-wireless", CN, "802.11 Standards",       0, { status: "done", confidence: "strong", lastReviewedAt: ts }),
    c("cn-wire-csma",     "cn-wireless", CN, "CSMA/CA",               1, { status: "done", confidence: "ok", lastReviewedAt: ts }),
    c("cn-wire-cellular", "cn-wireless", CN, "Cellular Networks (4G/5G)", 2, { status: "not_started", confidence: null }),

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

    n("os-intro",     OS, "Introduction to OS",              0),
    n("os-processes", OS, "Process Management",              1),
    n("os-threads",   OS, "Threads & Concurrency",           2),
    n("os-memory",    OS, "Memory Management",               3),
    n("os-fs",        OS, "File Systems",                    4),
    n("os-io",        OS, "I/O Management",                  5),

    c("os-intro-types",    "os-intro", OS, "Types of Operating Systems",    0, { status: "done", confidence: "strong", lastReviewedAt: ts }),
    c("os-intro-syscalls", "os-intro", OS, "System Calls",                  1, { status: "done", confidence: "ok", lastReviewedAt: ts }),
    c("os-intro-arch",     "os-intro", OS, "OS Architecture",               2, { status: "in_progress", confidence: "weak", lastReviewedAt: ts }),

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

    c("os-mlq-basic",    "os-proc-sched-mlq", OS, "Multilevel Queue Basics",     0, { status: "in_progress", confidence: "ok", lastReviewedAt: ts }),
    c("os-mlq-feedback", "os-proc-sched-mlq", OS, "Multilevel Feedback Queue",   1),

    c("os-mlq-fb-aging", "os-mlq-feedback", OS, "Aging & Priority Boost",  0, { status: "not_started", confidence: null }),
    c("os-mlq-fb-tune",  "os-mlq-feedback", OS, "Tuning MLFQ Parameters",   1, { status: "not_started", confidence: null }),

    c("os-proc-sync-critical", "os-proc-sync", OS, "Critical Section Problem",        0, { status: "done", confidence: "strong", lastReviewedAt: ts }),
    c("os-proc-sync-sem",      "os-proc-sync", OS, "Semaphores & Mutexes",            1, { status: "done", confidence: "ok", lastReviewedAt: ts }),
    c("os-proc-sync-monitor",  "os-proc-sync", OS, "Monitors & Condition Variables",  2, { status: "in_progress", confidence: "weak", lastReviewedAt: ts }),
    c("os-proc-sync-classic",  "os-proc-sync", OS, "Classic Sync Problems",           3, { status: "not_started", confidence: null }),

    c("os-proc-deadlock-cond",  "os-proc-deadlock", OS, "Deadlock Conditions",         0, { status: "done", confidence: "strong", lastReviewedAt: ts }),
    c("os-proc-deadlock-avoid", "os-proc-deadlock", OS, "Deadlock Avoidance (Banker's)",1, { status: "in_progress", confidence: "weak", lastReviewedAt: ts }),
    c("os-proc-deadlock-detect","os-proc-deadlock", OS, "Deadlock Detection & Recovery",2, { status: "not_started", confidence: null }),

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

    c("tree-avl-rotations", "tree-avl", TR, "AVL Rotations",    0),
    c("tree-avl-insert",    "tree-avl", TR, "AVL Insertion",    1),
    c("tree-avl-delete",    "tree-avl", TR, "AVL Deletion",     2),

    c("tree-avl-rot-ll", "tree-avl-rotations", TR, "LL Rotation (Right Rotate)",  0, { status: "done", confidence: "strong", lastReviewedAt: ts }),
    c("tree-avl-rot-rr", "tree-avl-rotations", TR, "RR Rotation (Left Rotate)",  1, { status: "done", confidence: "strong", lastReviewedAt: ts }),
    c("tree-avl-rot-lr", "tree-avl-rotations", TR, "LR Rotation (Left-Right)",   2, { status: "in_progress", confidence: "weak", lastReviewedAt: ts }),
    c("tree-avl-rot-rl", "tree-avl-rotations", TR, "RL Rotation (Right-Left)",   3, { status: "in_progress", confidence: "weak", lastReviewedAt: ts }),

    c("tree-avl-ins-basic",   "tree-avl-insert", TR, "AVL Insertion Steps",        0, { status: "done", confidence: "ok", lastReviewedAt: ts }),
    c("tree-avl-ins-complex", "tree-avl-insert", TR, "Complex Insertion Cases",    1, { status: "not_started", confidence: null }),

    c("tree-avl-del-basic",   "tree-avl-delete", TR, "AVL Deletion Steps",         0, { status: "not_started", confidence: null }),
    c("tree-avl-del-complex", "tree-avl-delete", TR, "Complex Deletion Cases",     1, { status: "not_started", confidence: null }),

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

    c("dp-lis-basic", "dp-1d-lis", DP, "LIS O(n²) DP",   0, { status: "done", confidence: "strong", lastReviewedAt: ts }),
    c("dp-lis-optim", "dp-1d-lis", DP, "LIS O(n log n) with Binary Search", 1),

    c("dp-lis-opt-patience", "dp-1d-lis-optim", DP, "Patience Sorting", 0, { status: "in_progress", confidence: "weak", lastReviewedAt: ts }),
    c("dp-lis-opt-print",    "dp-1d-lis-optim", DP, "Printing LIS",     1, { status: "not_started", confidence: null }),

    c("dp-coins-basic", "dp-1d-coins", DP, "Coin Change (Min Coins)",  0, { status: "done", confidence: "ok", lastReviewedAt: ts }),
    c("dp-coins-ways",  "dp-1d-coins", DP, "Coin Change 2 (Ways)",     1, { status: "in_progress", confidence: "weak", lastReviewedAt: ts }),

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
}

export async function seedUserData(userId: string, prisma: PrismaClient): Promise<void> {
  const existingGroups = await prisma.workspaceGroup.count({ where: { userId } });
  if (existingGroups > 0) return;

  const crypto = await import("crypto");

  await prisma.workspaceGroup.createMany({
    data: SEED_GROUPS.map((g) => ({ ...g, userId })),
  });

  await prisma.workspace.createMany({
    data: SEED_WORKSPACES.map((w) => ({
      id: w.id,
      name: w.name,
      groupId: w.groupId,
      orderIndex: w.orderIndex,
      userId,
    })),
  });

  const seedNodes = buildSeedNodes();
  const sorted = seedNodes
    .slice()
    .sort((a, b) => {
      function depth(nodes: typeof seedNodes, id: string, d = 0): number {
        const node = nodes.find((x) => x.id === id);
        if (!node || !node.parentId) return d;
        return depth(nodes, node.parentId, d + 1);
      }
      return depth(seedNodes, a.id) - depth(seedNodes, b.id);
    });
  for (const n of sorted) {
    await prisma.node.create({
      data: {
        id: n.id,
        workspaceId: n.workspaceId,
        parentId: n.parentId,
        title: n.title,
        status: n.status as NodeStatus | null,
        confidence: n.confidence as NodeConfidence | null,
        notes: n.notes,
        lastReviewedAt: n.lastReviewedAt ? new Date(n.lastReviewedAt) : null,
        orderIndex: n.orderIndex,
        userId,
      },
    });
  }

  const activityLogs = deriveSeedActivityLogs(seedNodes);
  if (activityLogs.length > 0) {
    await prisma.nodeActivity.createMany({
      data: activityLogs.map((log) => ({
        ...log,
        id: crypto.randomUUID(),
        userId,
      })),
    });
  }
}
