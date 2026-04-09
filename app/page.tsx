"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import * as storage from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sparkles,
  ArrowRight,
  Folder,
  Code,
  Book,
  Compass,
  Cpu,
  Palette,
  Briefcase,
  Plus,
  Loader2,
  ShieldCheck,
  User,
  Lock,
  Copy,
  GripVertical,
} from "lucide-react";
import {
  Book01Icon,
  CodeIcon,
  CompassIcon,
  CpuIcon,
  PaintBoardIcon,
  Briefcase01Icon,
  PencilEdit01Icon,
  Folder01Icon,
  Chemistry03Icon,
  GlobeIcon,
  MusicNote01Icon,
  Camera01Icon,
  HeadphonesIcon,
  RocketIcon,
  StarIcon,
  FlashlightIcon,
  MoonIcon,
  Sun01Icon,
  Leaf01Icon,
  MountainIcon,
  ArtificialIntelligence01Icon,
  BrainIcon,
  LaptopIcon,
  DatabaseIcon,
  ComputerTerminal01Icon,
  GitBranchIcon,
  PuzzleIcon,
  CrownIcon,
  DiamondIcon,
  Key01Icon,
  LockIcon,
  Shield01Icon,
  ZapIcon,
  FireIcon,
  Plant01Icon,
  Coffee01Icon,
  Telescope01Icon,
  Atom01Icon,
  DnaIcon,
  MicroscopeIcon,
  BookOpen01Icon,
  PenTool01Icon,
  Layers01Icon,
  GemIcon,
  SparklesIcon,
  AnchorIcon,
  FeatherIcon,
  Clock01Icon,
  MapPinIcon,
  Compass01Icon,
  UserIcon,
  SecurityLockIcon,
  Copy01Icon,
  InformationCircleIcon,
  CheckmarkCircle01Icon,
  Tick02Icon,
} from "hugeicons-react";
import { toast } from "sonner";
import Illustration from "@/components/illustration";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import EnclaveDialog from "@/components/enclave-onboarding";

const AVATARS = [
  // Writing & Reading
  {
    id: "Book",
    icon: Book01Icon,
    color: "text-orange-400",
    bg: "bg-orange-400/10",
  },
  {
    id: "BookOpen",
    icon: BookOpen01Icon,
    color: "text-amber-400",
    bg: "bg-amber-400/10",
  },
  {
    id: "PenTool",
    icon: PenTool01Icon,
    color: "text-yellow-400",
    bg: "bg-yellow-400/10",
  },
  {
    id: "Pencil",
    icon: PencilEdit01Icon,
    color: "text-lime-400",
    bg: "bg-lime-400/10",
  },
  {
    id: "Feather",
    icon: FeatherIcon,
    color: "text-green-400",
    bg: "bg-green-400/10",
  },

  // Code & Tech
  {
    id: "Code",
    icon: CodeIcon,
    color: "text-indigo-400",
    bg: "bg-indigo-400/10",
  },
  {
    id: "Terminal",
    icon: ComputerTerminal01Icon,
    color: "text-violet-400",
    bg: "bg-violet-400/10",
  },
  { id: "Cpu", icon: CpuIcon, color: "text-cyan-400", bg: "bg-cyan-400/10" },
  {
    id: "Laptop",
    icon: LaptopIcon,
    color: "text-sky-400",
    bg: "bg-sky-400/10",
  },
  {
    id: "Database",
    icon: DatabaseIcon,
    color: "text-blue-400",
    bg: "bg-blue-400/10",
  },
  {
    id: "GitBranch",
    icon: GitBranchIcon,
    color: "text-purple-400",
    bg: "bg-purple-400/10",
  },

  // Art & Creativity
  {
    id: "Palette",
    icon: PaintBoardIcon,
    color: "text-pink-400",
    bg: "bg-pink-400/10",
  },
  {
    id: "Camera",
    icon: Camera01Icon,
    color: "text-rose-400",
    bg: "bg-rose-400/10",
  },
  {
    id: "Layers",
    icon: Layers01Icon,
    color: "text-fuchsia-400",
    bg: "bg-fuchsia-400/10",
  },
  {
    id: "Music",
    icon: MusicNote01Icon,
    color: "text-red-400",
    bg: "bg-red-400/10",
  },
  {
    id: "Headphones",
    icon: HeadphonesIcon,
    color: "text-orange-300",
    bg: "bg-orange-300/10",
  },

  // Work & Organization
  {
    id: "Briefcase",
    icon: Briefcase01Icon,
    color: "text-amber-400",
    bg: "bg-amber-400/10",
  },
  {
    id: "Folder",
    icon: Folder01Icon,
    color: "text-yellow-300",
    bg: "bg-yellow-300/10",
  },
  {
    id: "Compass",
    icon: CompassIcon,
    color: "text-emerald-400",
    bg: "bg-emerald-400/10",
  },
  {
    id: "Puzzle",
    icon: PuzzleIcon,
    color: "text-teal-400",
    bg: "bg-teal-400/10",
  },
  {
    id: "Clock",
    icon: Clock01Icon,
    color: "text-slate-400",
    bg: "bg-slate-400/10",
  },

  // Science & Research
  {
    id: "Chemistry",
    icon: Chemistry03Icon,
    color: "text-green-400",
    bg: "bg-green-400/10",
  },
  {
    id: "Atom",
    icon: Atom01Icon,
    color: "text-blue-300",
    bg: "bg-blue-300/10",
  },
  {
    id: "Dna",
    icon: DnaIcon,
    color: "text-emerald-300",
    bg: "bg-emerald-300/10",
  },
  {
    id: "Microscope",
    icon: MicroscopeIcon,
    color: "text-cyan-300",
    bg: "bg-cyan-300/10",
  },
  {
    id: "Telescope",
    icon: Telescope01Icon,
    color: "text-indigo-300",
    bg: "bg-indigo-300/10",
  },

  // AI & Intelligence
  {
    id: "AI",
    icon: ArtificialIntelligence01Icon,
    color: "text-violet-400",
    bg: "bg-violet-400/10",
  },
  {
    id: "Brain",
    icon: BrainIcon,
    color: "text-purple-400",
    bg: "bg-purple-400/10",
  },

  // Nature & World
  { id: "Globe", icon: GlobeIcon, color: "text-sky-400", bg: "bg-sky-400/10" },
  {
    id: "Leaf",
    icon: Leaf01Icon,
    color: "text-green-500",
    bg: "bg-green-500/10",
  },
  {
    id: "Mountain",
    icon: MountainIcon,
    color: "text-stone-400",
    bg: "bg-stone-400/10",
  },
  {
    id: "Plant",
    icon: Plant01Icon,
    color: "text-lime-500",
    bg: "bg-lime-500/10",
  },

  // Lifestyle
  {
    id: "Coffee",
    icon: Coffee01Icon,
    color: "text-amber-600",
    bg: "bg-amber-600/10",
  },

  // Achievement & Identity
  {
    id: "Crown",
    icon: CrownIcon,
    color: "text-yellow-400",
    bg: "bg-yellow-400/10",
  },
  {
    id: "Diamond",
    icon: DiamondIcon,
    color: "text-cyan-400",
    bg: "bg-cyan-400/10",
  },
  { id: "Gem", icon: GemIcon, color: "text-rose-400", bg: "bg-rose-400/10" },
  {
    id: "Star",
    icon: StarIcon,
    color: "text-yellow-300",
    bg: "bg-yellow-300/10",
  },
  {
    id: "Sparkles",
    icon: SparklesIcon,
    color: "text-amber-300",
    bg: "bg-amber-300/10",
  },

  // Security & Privacy
  {
    id: "Key",
    icon: Key01Icon,
    color: "text-yellow-500",
    bg: "bg-yellow-500/10",
  },
  {
    id: "Lock",
    icon: LockIcon,
    color: "text-slate-400",
    bg: "bg-slate-400/10",
  },
  {
    id: "Shield",
    icon: Shield01Icon,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },

  // Energy & Action
  {
    id: "Zap",
    icon: ZapIcon,
    color: "text-yellow-400",
    bg: "bg-yellow-400/10",
  },
  {
    id: "Fire",
    icon: FireIcon,
    color: "text-orange-500",
    bg: "bg-orange-500/10",
  },
  {
    id: "Rocket",
    icon: RocketIcon,
    color: "text-red-400",
    bg: "bg-red-400/10",
  },
  {
    id: "Flashlight",
    icon: FlashlightIcon,
    color: "text-amber-400",
    bg: "bg-amber-400/10",
  },

  // Time & Place
  {
    id: "Moon",
    icon: MoonIcon,
    color: "text-indigo-300",
    bg: "bg-indigo-300/10",
  },
  {
    id: "Sun",
    icon: Sun01Icon,
    color: "text-yellow-400",
    bg: "bg-yellow-400/10",
  },
  {
    id: "MapPin",
    icon: MapPinIcon,
    color: "text-red-400",
    bg: "bg-red-400/10",
  },
  {
    id: "Anchor",
    icon: AnchorIcon,
    color: "text-teal-500",
    bg: "bg-teal-500/10",
  },
  {
    id: "Compass2",
    icon: Compass01Icon,
    color: "text-emerald-300",
    bg: "bg-emerald-300/10",
  },
];

const ADJECTIVES = [
  "Silent",
  "Green",
  "Bright",
  "Dark",
  "Neon",
  "Crimson",
  "Azure",
  "Golden",
  "Wandering",
  "Cosmic",
  "Lunar",
  "Solar",
  "Hidden",
  "Frost",
  "Electric",
  "Velvet",
];
const NOUNS = [
  "Apple",
  "Avocado",
  "Phoenix",
  "Wolf",
  "River",
  "Mountain",
  "Forest",
  "Ocean",
  "Nebula",
  "Comet",
  "Owl",
  "Tiger",
  "Fox",
  "Panda",
  "Lotus",
  "Oak",
];

function generateUsername() {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  return `${adj} ${noun}`;
}

function generateRecoveryCode() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 16; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
    if (i === 3 || i === 7 || i === 11) result += "-";
  }
  return result;
}

const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  } catch (err) {
    toast.error("Failed to copy");
  }
};

type AppState = "booting" | "setup" | "login" | "dashboard";

export default function HomePage() {
  const [appState, setAppState] = useState<AppState>("booting");
  const [velaUser, setVelaUser] = useState<{
    username: string;
    hash: string;
  } | null>(null);

  const [setupStep, setSetupStep] = useState(1);
  const [generatedUser, setGeneratedUser] = useState("");
  const [generatedRecoveryCode, setGeneratedRecoveryCode] = useState("");
  const [passphrase, setPassphrase] = useState("");

  const [loginPassphrase, setLoginPassphrase] = useState("");
  const [loginError, setLoginError] = useState(false);
  const [isRecovering, setIsRecovering] = useState(false);
  const [recoveryInput, setRecoveryInput] = useState("");

  const [enclaves, setEnclaves] = useState<storage.EnclaveRecord[]>([]);
  const [showEnclaveOnboarding, setShowEnclaveOnboarding] = useState(false);
  const router = useRouter();

  const [encStep, setEncStep] = useState(1);
  const [encName, setEncName] = useState("");
  const [encPurpose, setEncPurpose] = useState("Workspace");
  const [encAvatar, setEncAvatar] = useState("Book");
  const [editingEnclaveId, setEditingEnclaveId] = useState<string | null>(null);
  const [enclaveToDelete, setEnclaveToDelete] =
    useState<storage.EnclaveRecord | null>(null);

  const startNewEnclave = () => {
    setEditingEnclaveId(null);
    setEncName("");
    setEncPurpose("Workspace");
    setEncAvatar("Book");
    setEncStep(1);
    setShowEnclaveOnboarding(true);
  };

  const [draggedEnclaveId, setDraggedEnclaveId] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedEnclaveId(id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedEnclaveId || draggedEnclaveId === targetId) return;

    const draggedIdx = enclaves.findIndex((enc) => enc.id === draggedEnclaveId);
    const targetIdx = enclaves.findIndex((enc) => enc.id === targetId);

    const newEnclaves = [...enclaves];
    const [draggedItem] = newEnclaves.splice(draggedIdx, 1);
    newEnclaves.splice(targetIdx, 0, draggedItem);

    // Give them ordered values
    newEnclaves.forEach((enc, idx) => {
      enc.order = idx;
    });

    setEnclaves(newEnclaves);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDraggedEnclaveId(null);
    // Persist new ordering for all
    for (const enc of enclaves) {
      await storage.saveEnclave(enc);
    }
  };

  const handleDuplicateEnclave = async (
    enclave: storage.EnclaveRecord,
    e: React.MouseEvent,
  ) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const newId = crypto.randomUUID();
      const newEnclave: storage.EnclaveRecord = {
        ...enclave,
        id: newId,
        name: `${enclave.name} (Copy)`,
        createdAt: Date.now(),
        order: Date.now(),
      };

      await storage.saveEnclave(newEnclave);

      // Duplicate files
      storage.setActiveEnclave(enclave.id);
      const existingFiles = await storage.getAllFiles();
      storage.setActiveEnclave(newId);
      await storage.bulkSave(
        existingFiles.map((f) => ({ ...f, path: f.path })),
      );

      setEnclaves((prev) =>
        [...prev, newEnclave].sort(
          (a, b) => (a.order ?? a.createdAt) - (b.order ?? b.createdAt),
        ),
      );
      toast.success("Enclave duplicated");
    } catch (err) {
      console.error(err);
      toast.error("Failed to duplicate enclave");
    }
  };

  const handleDeleteEnclave = async (id: string) => {
    try {
      await storage.deleteEnclave(id); // make sure this exists
      setEnclaves((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditEnclave = (
    enc: storage.EnclaveRecord,
    e: React.MouseEvent,
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingEnclaveId(enc.id);
    setEncName(enc.name);
    setEncPurpose(enc.purpose || "Workspace");
    setEncAvatar(enc.avatar || "Book");
    setEncStep(1);
    setShowEnclaveOnboarding(true);
  };

  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await copyToClipboard(generatedRecoveryCode);
    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 1500);
  };

  useEffect(() => {
    async function init() {
      try {
        await storage.migrateLegacyData();
        const storedUser = localStorage.getItem("vela-user");
        const isLoggedIn = sessionStorage.getItem("vela-logged-in");

        if (!storedUser) {
          setGeneratedUser(generateUsername());
          setGeneratedRecoveryCode(generateRecoveryCode());
          setAppState("setup");
        } else {
          setVelaUser(JSON.parse(storedUser));
          if (isLoggedIn) {
            await loadEnclaves();
            setAppState("dashboard");
          } else {
            setAppState("login");
          }
        }
      } catch (err) {
        console.error(err);
      }
    }
    init();
  }, []);

  const loadEnclaves = async () => {
    const list = await storage.getEnclaves();
    setEnclaves(list);
    if (list.length === 0) setShowEnclaveOnboarding(true);
  };

  const handleSetupComplete = async () => {
    if (!passphrase.trim()) {
      toast.error("Passphrase cannot be empty.");
      return;
    }
    const user = {
      username: generatedUser,
      hash: btoa(passphrase),
      recoveryCode: generatedRecoveryCode,
    };
    localStorage.setItem("vela-user", JSON.stringify(user));
    sessionStorage.setItem("vela-logged-in", "1");
    setVelaUser(user as any);
    setPassphrase("");
    await loadEnclaves();
    setAppState("dashboard");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!velaUser || btoa(loginPassphrase) !== velaUser.hash) {
      setLoginError(true);
      return;
    }
    setLoginError(false);
    setLoginPassphrase("");
    setRecoveryInput("");
    sessionStorage.setItem("vela-logged-in", "1");
    await loadEnclaves();
    setAppState("dashboard");
  };

  const handleSaveEnclave = async (data: {
    id?: string;
    name: string;
    avatar: string;
  }) => {
    try {
      if (data.id) {
        // ✏️ EDIT MODE
        const updated = enclaves.map((e) =>
          e.id === data.id ? { ...e, name: data.name, avatar: data.avatar } : e,
        );

        setEnclaves(updated);

        await storage.saveEnclave({
          ...enclaves.find((e) => e.id === data.id)!,
          name: data.name,
          avatar: data.avatar,
        });
      } else {
        // ➕ CREATE MODE
        const newEnclave: storage.EnclaveRecord = {
          id: crypto.randomUUID(),
          name: data.name,
          purpose: "Workspace",
          avatar: data.avatar,
          theme: "dark",
          createdAt: Date.now(),
          order: Date.now(),
        };

        await storage.saveEnclave(newEnclave);
        setEnclaves((prev) => [...prev, newEnclave]);
      }

      setShowEnclaveOnboarding(false);
      setEditingEnclaveId(null);
    } catch (err) {
      console.error(err);
      toast.error("Failed to save enclave");
    }
  };

  const getAvatarIcon = (id: string) => {
    const found = AVATARS.find((a) => a.id === id);
    if (!found) return <Folder01Icon className="w-8 h-8 text-sky-400" />;
    const Icon = found.icon;
    return <Icon className={`w-8 h-8 ${found.color}`} />;
  };

  const getAvatarBg = (id: string) => {
    const found = AVATARS.find((a) => a.id === id);
    if (!found) return "bg-sky-400/10";
    return found.bg;
  };

  if (appState === "booting") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050505]">
        <Loader2 className="w-8 h-8 animate-spin text-white/50" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white overflow-hidden relative font-sans">
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/30 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-pink-600/20 blur-[150px] rounded-full pointer-events-none" />

      {/* SETUP WIZARD */}
      {appState === "setup" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-background/80 backdrop-blur-xl">
          {/* Modal shell */}
          <div className="relative w-full max-w-sm md:max-w-4xl animate-in zoom-in-95 duration-500 bg-card border border-border rounded-3xl shadow-2xl overflow-hidden">
            <div className="flex flex-col md:flex-row min-h-[520px]">
              {/* ─── LEFT PANEL (PC only) ─── */}
              <div className="hidden md:flex flex-col justify-between w-[280px] flex-shrink-0 p-8 border-r border-border bg-card/50">
                {/* Brand */}
                <div>
                  <div className="flex items-center gap-3 mb-10">
                    <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
                      <SparklesIcon className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <span className="text-xl font-bold tracking-tight text-foreground">
                      Velä
                    </span>
                  </div>

                  {/* Step indicators */}
                  <div className="space-y-1">
                    {[
                      {
                        n: 1,
                        label: "Privacy First",
                        sub: "Local-only by design",
                      },
                      {
                        n: 2,
                        label: "Enclaves",
                        sub: "Isolated creative spaces",
                      },
                      {
                        n: 3,
                        label: "Your Identity",
                        sub: "Secure your universe",
                      },
                    ].map(({ n, label, sub }) => {
                      const done = setupStep > n;
                      const active = setupStep === n;
                      return (
                        <div
                          key={n}
                          className="flex items-center gap-3 p-2 rounded-xl transition-colors"
                          style={{
                            background: active
                              ? "hsl(var(--primary) / 0.08)"
                              : "transparent",
                          }}
                        >
                          <div
                            className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 border transition-all"
                            style={{
                              background: done
                                ? "hsl(var(--primary))"
                                : active
                                  ? "hsl(var(--primary) / 0.15)"
                                  : "hsl(var(--muted))",
                              borderColor: active
                                ? "hsl(var(--primary) / 0.6)"
                                : done
                                  ? "transparent"
                                  : "hsl(var(--border))",
                              boxShadow: active
                                ? "0 0 10px hsl(var(--primary) / 0.3)"
                                : "none",
                            }}
                          >
                            {done ? (
                              <CheckmarkCircle01Icon className="w-4 h-4 text-primary-foreground" />
                            ) : (
                              <span
                                className="text-[11px] font-bold"
                                style={{
                                  color: active
                                    ? "hsl(var(--primary))"
                                    : "hsl(var(--muted-foreground))",
                                }}
                              >
                                {n}
                              </span>
                            )}
                          </div>
                          <div>
                            <div
                              className="text-[13px] font-semibold transition-colors"
                              style={{
                                color: active
                                  ? "hsl(var(--foreground))"
                                  : done
                                    ? "hsl(var(--muted-foreground))"
                                    : "hsl(var(--muted-foreground) / 0.5)",
                              }}
                            >
                              {label}
                            </div>
                            <div className="text-[11px] text-muted-foreground/50 mt-0.5">
                              {sub}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <p className="text-[11px] text-muted-foreground/40 leading-relaxed">
                  Everything stays on your device.
                  <br />
                  No servers. No telemetry.
                </p>
              </div>

              {/* ─── RIGHT / MAIN PANEL ─── */}
              <div className="flex-1 p-6 md:p-10 flex flex-col">
                {/* Mobile header */}
                <div className="flex md:hidden items-center gap-3 mb-6">
                  <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
                    <SparklesIcon className="w-4 h-4 text-primary-foreground" />
                  </div>
                  <span className="text-lg font-bold tracking-tight text-foreground">
                    Velä
                  </span>
                  {/* Mobile step dots */}
                  <div className="ml-auto flex gap-1.5">
                    {[1, 2, 3].map((n) => (
                      <div
                        key={n}
                        className="h-1.5 rounded-full transition-all duration-300"
                        style={{
                          width: setupStep === n ? 20 : 6,
                          background:
                            setupStep === n
                              ? "hsl(var(--primary))"
                              : setupStep > n
                                ? "hsl(var(--primary) / 0.5)"
                                : "hsl(var(--muted))",
                        }}
                      />
                    ))}
                  </div>
                </div>

                {/* ── STEP 1 ── */}
                {setupStep === 1 && (
                  <div className="flex flex-col md:flex-row gap-6 md:gap-10 animate-in slide-in-from-right-4 flex-1">
                    <div className="flex items-center justify-center md:w-48 flex-shrink-0">
                      <Illustration
                        src="/illustrations/undraw_morning-plans_5vln.svg"
                        className="h-36 md:h-48 opacity-90"
                      />
                    </div>
                    <div className="flex flex-col justify-center gap-4 flex-1">
                      <div>
                        <p className="text-[11px] font-bold tracking-widest text-primary uppercase mb-2">
                          Step 1 of 3
                        </p>
                        <h3 className="text-[22px] font-bold tracking-tight text-foreground mb-2">
                          Your privacy, absolute.
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          Velä is designed as a standalone environment that
                          lives entirely within your device. No servers, no
                          trackers, no external connections — your thoughts,
                          files, and interactions are completely local.
                        </p>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-primary/5 border border-primary/15">
                        <InformationCircleIcon className="w-4 h-4 text-primary flex-shrink-0" />
                        <span className="text-xs text-muted-foreground">
                          Zero data leaves this machine — ever.
                        </span>
                      </div>
                      <Button
                        onClick={() => setSetupStep(2)}
                        className="h-12 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 mt-2"
                      >
                        Continue <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* ── STEP 2 ── */}
                {setupStep === 2 && (
                  <div className="flex flex-col md:flex-row gap-6 md:gap-10 animate-in slide-in-from-right-4 flex-1">
                    <div className="flex items-center justify-center md:w-48 flex-shrink-0">
                      <Illustration
                        src="/illustrations/undraw_control-panel_s0j2.svg"
                        className="h-36 md:h-48 opacity-90"
                      />
                    </div>
                    <div className="flex flex-col justify-center gap-4 flex-1">
                      <div>
                        <p className="text-[11px] font-bold tracking-widest text-primary uppercase mb-2">
                          Step 2 of 3
                        </p>
                        <h3 className="text-[22px] font-bold tracking-tight text-foreground mb-2">
                          Worlds within worlds.
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          Enclaves are isolated creative spaces tailored to a
                          specific purpose. One for code, one for journaling,
                          one for research. Data never crosses between Enclaves
                          unless explicitly commanded.
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { icon: CodeIcon, label: "Development" },
                          { icon: Book01Icon, label: "Journaling" },
                          { icon: MicroscopeIcon, label: "Research" },
                          { icon: PuzzleIcon, label: "Custom" },
                        ].map(({ icon: Icon, label }) => (
                          <div
                            key={label}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-muted/30 border border-border text-xs text-muted-foreground"
                          >
                            <Icon className="w-4 h-4 flex-shrink-0" />
                            {label}
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-3 mt-1">
                        <Button
                          variant="ghost"
                          onClick={() => setSetupStep(1)}
                          className="h-12 rounded-xl border border-border w-24 hover:bg-muted/50"
                        >
                          Back
                        </Button>
                        <Button
                          onClick={() => setSetupStep(3)}
                          className="flex-1 h-12 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
                        >
                          Continue <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── STEP 3 ── */}
                {setupStep === 3 && (
                  <div className="animate-in slide-in-from-right-4 flex flex-col gap-5 flex-1">
                    <div>
                      <p className="text-[11px] font-bold tracking-widest text-primary uppercase mb-2">
                        Step 3 of 3
                      </p>
                      <h3 className="text-[22px] font-bold tracking-tight text-foreground">
                        Secure your universe.
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
                      {/* LEFT col */}
                      <div className="flex flex-col gap-4">
                        <div className="hidden md:flex items-center justify-center flex-1">
                          <Illustration
                            src="/illustrations/undraw_authentication_1evl.svg"
                            className="h-36 opacity-90"
                          />
                        </div>
                        {/* Alias card */}
                        <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                              <UserIcon className="w-4 h-4 text-primary" />
                            </div>
                            <div>
                              <div className="text-[15px] font-bold text-foreground">
                                {generatedUser}
                              </div>
                              <div className="text-[10px] text-muted-foreground uppercase tracking-widest mt-0.5">
                                Local Alias
                              </div>
                            </div>
                          </div>
                          <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(74,222,128,0.6)]" />
                        </div>
                      </div>

                      {/* RIGHT col */}
                      <div className="flex flex-col gap-4">
                        {/* Passphrase */}
                        <div className="space-y-2">
                          <label className="text-xs font-semibold text-muted-foreground flex justify-between items-center">
                            <span>Master Passphrase</span>
                            <span className="text-[10px] text-muted-foreground/50 font-mono">
                              Secures your universe
                            </span>
                          </label>
                          <Input
                            type="password"
                            autoFocus
                            placeholder="Min 6 characters recommended"
                            value={passphrase}
                            onChange={(e) => setPassphrase(e.target.value)}
                            className="h-12 rounded-xl bg-background border-border text-foreground text-sm focus-visible:ring-primary"
                          />
                        </div>

                        {/* Recovery key */}
                        <div className="p-4 rounded-xl bg-muted/20 border border-border space-y-2">
                          <div className="flex items-center gap-2">
                            <SecurityLockIcon className="w-4 h-4 text-muted-foreground" />
                            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                              Recovery Key
                            </span>
                          </div>
                          <p className="text-[11px] text-muted-foreground/60 leading-relaxed">
                            Forget your passphrase? This is the{" "}
                            <span className="text-foreground font-semibold">
                              ONLY WAY
                            </span>{" "}
                            to regain access.
                          </p>
                          <div
                            onClick={handleCopy}
                            className={`group relative active:scale-[0.98] transition-all cursor-pointer p-3 rounded-lg border font-mono text-xs text-center tracking-widest select-none
    ${
      copied
        ? "bg-green-500/10 border-green-500 text-green-600"
        : "bg-background border-border text-foreground"
    }`}
                          >
                            {generatedRecoveryCode}

                            <div
                              className={`absolute inset-0 flex items-center justify-center transition-opacity rounded-lg pointer-events-none
      ${
        copied
          ? "opacity-100 bg-green-500/10"
          : "opacity-0 group-hover:opacity-100 bg-foreground/[0.03]"
      }`}
                            >
                              <span
                                className={`flex items-center gap-1.5 text-[10px] px-2 py-1 rounded-md border font-sans tracking-normal
        ${
          copied
            ? "bg-green-500 text-white border-green-500"
            : "bg-card text-muted-foreground border-border"
        }`}
                              >
                                {copied ? (
                                  <>
                                    <Tick02Icon className="w-3 h-3" />
                                    Copied
                                  </>
                                ) : (
                                  <>
                                    <Copy01Icon className="w-3 h-3" />
                                    Click to copy
                                  </>
                                )}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3 pt-1">
                      <Button
                        variant="ghost"
                        onClick={() => setSetupStep(2)}
                        className="h-12 rounded-xl border border-border w-24 hover:bg-muted/50"
                      >
                        Back
                      </Button>
                      <Button
                        onClick={handleSetupComplete}
                        disabled={!passphrase.trim()}
                        className="flex-1 h-12 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-30 disabled:cursor-not-allowed transition-opacity"
                      >
                        Finish Setup <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* BRANDING FOOTER */}
      {appState === "setup" && (
        <div
          className="z-50 mt-3 flex justify-center items-center gap-2 group cursor-pointer hover:opacity-80 transition-opacity bg-black/20 backdrop-blur-sm px-4 py-2 rounded-full border border-white/5 shadow-2xl"
          onClick={() => window.open("https://amplecen.com", "_blank")}
        >
          <span className="text-[10px] uppercase tracking-[0.3em] text-neutral-500 group-hover:text-neutral-300 transition-colors font-medium">
            Velä
          </span>
          <div className="w-1 h-1 rounded-full bg-neutral-700 group-hover:bg-indigo-500 transition-colors" />
          <span className="text-[10px] uppercase tracking-[0.3em] text-neutral-500 group-hover:text-neutral-300 transition-colors font-medium">
            By Amplecen
          </span>
        </div>
      )}

      {/* LOGIN SCREEN */}
      {appState === "login" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-xl bg-black/60">
          <div className="max-w-md w-full bg-neutral-900/80 border border-white/10 p-8 rounded-3xl shadow-2xl backdrop-blur-2xl">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight">
                {isRecovering ? "Recovery Access" : "Unlock Velä"}
              </h2>
            </div>
            <p className="text-neutral-400 text-sm mb-6">
              {isRecovering ? (
                "Enter your 16-digit recovery key to reset access."
              ) : (
                <>
                  Welcome back,{" "}
                  <span className="text-white font-medium">
                    {velaUser?.username}
                  </span>
                  .
                </>
              )}
            </p>

            <Illustration
              src="/illustrations/undraw_secure-usb-drive_7pj5.svg"
              className="h-32 mb-8 mx-auto opacity-80"
            />

            <form onSubmit={handleLogin} className="space-y-6">
              {!isRecovering ? (
                <div className="space-y-2">
                  <Input
                    type="password"
                    autoFocus
                    placeholder="Enter your passphrase..."
                    value={loginPassphrase}
                    onChange={(e) => {
                      setLoginPassphrase(e.target.value);
                      setLoginError(false);
                    }}
                    className={`bg-black/50 h-12 text-base rounded-xl ${loginError ? "border-red-500 focus-visible:ring-red-500" : "border-white/10 focus-visible:ring-indigo-500"}`}
                  />
                  <div className="flex justify-between items-center px-1">
                    {loginError && (
                      <p className="text-red-400 text-xs">
                        Incorrect passphrase.
                      </p>
                    )}
                    <button
                      type="button"
                      onClick={() => setIsRecovering(true)}
                      className="text-[11px] text-neutral-500 hover:text-white transition-colors underline ml-auto"
                    >
                      Forgot passphrase?
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <Input
                    type="text"
                    autoFocus
                    placeholder="ENTER-RECOVERY-CODE"
                    value={recoveryInput}
                    onChange={(e) => {
                      setRecoveryInput(e.target.value.toUpperCase());
                      setLoginError(false);
                    }}
                    className={`bg-black/50 h-12 text-base font-mono tracking-widest text-center rounded-xl ${loginError ? "border-red-500 focus-visible:ring-red-500" : "border-white/10 focus-visible:ring-indigo-500"}`}
                  />
                  <div className="flex justify-between items-center px-1">
                    {loginError && (
                      <p className="text-red-400 text-xs">
                        Invalid recovery key.
                      </p>
                    )}
                    <button
                      type="button"
                      onClick={() => setIsRecovering(false)}
                      className="text-[11px] text-neutral-500 hover:text-white transition-colors underline ml-auto"
                    >
                      Back to passphrase
                    </button>
                  </div>
                </div>
              )}

              <Button
                type="submit"
                onClick={(e) => {
                  if (isRecovering) {
                    e.preventDefault();
                    const stored = localStorage.getItem("vela-user");
                    if (stored) {
                      const user = JSON.parse(stored);
                      if (
                        recoveryInput.replace(/-/g, "") ===
                        user.recoveryCode?.replace(/-/g, "")
                      ) {
                        setAppState("setup"); // Force reset passphrase
                        setSetupStep(3);
                        setIsRecovering(false);
                        setRecoveryInput("");
                        setLoginPassphrase("");
                        toast.success(
                          "Identity verified. Please set a new passphrase.",
                        );
                      } else {
                        setLoginError(true);
                      }
                    }
                  }
                }}
                className={`w-full h-12 rounded-xl bg-white text-black hover:bg-neutral-200 ${isRecovering ? "bg-indigo-500 text-white hover:bg-indigo-600 border-0" : ""}`}
                disabled={isRecovering ? !recoveryInput : !loginPassphrase}
              >
                {isRecovering ? "Verify Identity" : "Unlock"}{" "}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </form>

            {/* IN-BOX BRANDING */}
            <div
              className="mt-8 pt-6 border-t border-white/5 flex justify-center items-center gap-1.5 opacity-60 hover:opacity-100 transition-opacity cursor-pointer group"
              onClick={() => window.open("https://amplecen.com", "_blank")}
            >
              <span className="text-[10px] uppercase tracking-[0.2em] text-neutral-400 font-medium">
                Velä
              </span>
              <span className="text-[10px] text-neutral-600">by</span>
              <span className="text-[10px] uppercase tracking-[0.2em] text-neutral-300 group-hover:text-white transition-colors font-semibold">
                Amplecen
              </span>
            </div>
          </div>
        </div>
      )}

      <EnclaveDialog
        open={showEnclaveOnboarding}
        onOpenChange={setShowEnclaveOnboarding}
        avatars={AVATARS}
        initialData={
          editingEnclaveId
            ? {
                id: editingEnclaveId,
                name: encName,
                avatar: encAvatar,
              }
            : null
        }
        onSave={handleSaveEnclave}
      />

      {/* DASHBOARD */}
      {appState === "dashboard" && (
        <div className="relative z-10 max-w-6xl mx-auto px-6 py-24">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="bg-white/10 text-white px-3 py-1 rounded-full text-xs font-medium tracking-wide">
                  Operator: {velaUser?.username}
                </span>
                <button
                  onClick={() => {
                    sessionStorage.removeItem("vela-logged-in");
                    setAppState("login");
                  }}
                  className="text-xs text-neutral-500 hover:text-white flex items-center gap-1"
                >
                  <Lock className="w-3 h-3" /> Lock
                </button>
              </div>
              <h1 className="text-5xl font-semibold tracking-tighter mb-4">
                Velä
              </h1>
              <p className="text-lg text-neutral-400 max-w-xl font-light">
                Your private, judgment-free universe array. Select a world to
                enter.
              </p>
            </div>
            {enclaves.length > 0 && (
              <Button
                onClick={startNewEnclave}
                className="bg-white/10 hover:bg-white/20 text-white border border-white/10 rounded-full px-6 h-12 backdrop-blur-md"
              >
                <Plus className="w-5 h-5 mr-2" /> New Enclave
              </Button>
            )}
          </div>

          {enclaves.length === 0 && !showEnclaveOnboarding ? (
            <div className="text-center py-32 border border-dashed border-white/10 rounded-3xl bg-white/[0.02]">
              <Sparkles className="w-12 h-12 text-neutral-500 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-neutral-300 mb-2">
                No Enclaves exist
              </h3>
              <p className="text-neutral-500 mb-6 font-light">
                Your universe array is completely empty.
              </p>
              <Button
                onClick={startNewEnclave}
                className="bg-white text-black hover:bg-neutral-200 rounded-full px-8 h-12"
              >
                Configure First Enclave
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enclaves.map((enclave) => (
                <div
                  key={enclave.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, enclave.id)}
                  onDragOver={(e) => handleDragOver(e, enclave.id)}
                  onDrop={handleDrop}
                  className={`group relative ${draggedEnclaveId === enclave.id ? "opacity-50" : "opacity-100"} transition-opacity`}
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-white/[0.08] to-transparent rounded-3xl transform group-hover:scale-[1.02] transition-transform duration-500 ease-out -z-10" />

                  <div className="bg-[#0f0f11] border border-white/5 rounded-3xl transition-colors duration-500 h-full flex flex-col overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/[0.02] rounded-full blur-3xl group-hover:bg-indigo-500/10 transition-colors duration-700 pointer-events-none" />

                    {/* ACTIONS BAR - ABSOLUTE POSITIONED TO TOP RIGHT */}
                    <div className="absolute top-4 right-4 z-20 flex gap-1 bg-black/60 backdrop-blur-lg p-1.5 rounded-full border border-white/10 opacity-100 transition-all shadow-xl">
                      {/* DRAG HANDLE */}
                      <div className="p-1.5 cursor-grab active:cursor-grabbing text-neutral-500 hover:text-white transition-colors">
                        <GripVertical className="w-4 h-4" />
                      </div>

                      {/* DUPLICATE */}
                      <button
                        onClick={(e) => handleDuplicateEnclave(enclave, e)}
                        className="p-1.5 rounded-full hover:bg-white/10 text-neutral-500 hover:text-white transition-colors"
                        title="Duplicate"
                      >
                        <Copy className="w-4 h-4" />
                      </button>

                      {/* EDIT */}
                      <button
                        onClick={(e) => handleEditEnclave(enclave, e)}
                        className="p-1.5 rounded-full hover:bg-white/10 text-neutral-500 hover:text-white transition-colors"
                        title="Edit"
                      >
                        <PencilEdit01Icon className="w-4 h-4" />
                      </button>

                      {/* DELETE */}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setEnclaveToDelete(enclave);
                        }}
                        className="p-1.5 rounded-full hover:bg-red-500/10 text-neutral-500 hover:text-red-400 transition-colors"
                        title="Delete"
                      >
                        🗑
                      </button>
                    </div>

                    {/* MAIN CLICKABLE AREA */}
                    <div
                      onClick={() => router.push(`/enclave/${enclave.id}`)}
                      className="p-8 flex-1 flex flex-col justify-between cursor-pointer group-hover:bg-white/[0.02] transition-colors"
                    >
                      <div>
                        <div className="flex justify-between items-start mb-6">
                          <div
                            className={`w-14 h-14 rounded-2xl flex items-center justify-center ${getAvatarBg(enclave.avatar)}`}
                          >
                            {getAvatarIcon(enclave.avatar)}
                          </div>
                        </div>
                        <h3 className="text-2xl font-medium tracking-tight font-heading mb-2 group-hover:text-white transition-colors">
                          {enclave.name}
                        </h3>
                        <p className="text-sm text-neutral-500 font-light">
                          {enclave.purpose || "Workspace"}
                        </p>
                      </div>

                      <div className="mt-8 flex items-center justify-between text-neutral-500">
                        <span className="text-xs font-mono bg-white/[0.03] px-3 py-1 rounded-full">
                          {new Date(enclave.createdAt).toLocaleDateString(
                            undefined,
                            { month: "short", day: "numeric", year: "numeric" },
                          )}
                        </span>
                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                          <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:text-white transition-colors" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-32 pb-20 flex flex-col items-center gap-4 opacity-50 hover:opacity-100 transition-all duration-700 group">
            <div className="h-px w-16 bg-gradient-to-r from-transparent via-neutral-700 to-transparent group-hover:via-indigo-500 transition-colors duration-500" />
            <a
              href="https://amplecen.com"
              target="_blank"
              className="flex items-center gap-3 group no-underline px-6 py-3 rounded-full hover:bg-white/[0.03] transition-colors"
            >
              <span className="text-[11px] uppercase tracking-[0.4em] text-neutral-500 group-hover:text-neutral-300 transition-colors font-medium">
                Velä
              </span>
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500/50 group-hover:bg-indigo-500 group-hover:scale-125 transition-all shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
              <span className="text-[11px] uppercase tracking-[0.4em] text-neutral-500 group-hover:text-neutral-300 transition-colors font-medium">
                Amplecen
              </span>
            </a>
          </div>
        </div>
      )}
      {/* DELETE CONFIRMATION DIALOG */}
      <Dialog
        open={!!enclaveToDelete}
        onOpenChange={(open) => !open && setEnclaveToDelete(null)}
      >
        <DialogContent className="max-w-md bg-neutral-900 border-white/10 rounded-3xl p-8">
          <DialogHeader>
            <DialogTitle>Delete Enclave</DialogTitle>
            <DialogDescription className="text-neutral-400 mt-2">
              Are you sure you want to delete{" "}
              <span className="text-white font-medium">
                "{enclaveToDelete?.name}"
              </span>
              ? This will permanently remove all files and data within this
              enclave.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-6 flex gap-3">
            <Button
              variant="ghost"
              onClick={() => setEnclaveToDelete(null)}
              className="rounded-xl border border-white/10"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (enclaveToDelete) {
                  handleDeleteEnclave(enclaveToDelete.id);
                  setEnclaveToDelete(null);
                  toast.success("Enclave deleted");
                }
              }}
              className="rounded-xl bg-red-600 hover:bg-red-700 text-white"
            >
              Confirm Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
