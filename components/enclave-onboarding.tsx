// components/EnclaveDialog.tsx
"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

type Avatar = {
  id: string;
  icon: any;
  color: string;
};

export default function EnclaveDialog({
  open,
  onOpenChange,
  onSave,
  avatars,
  initialData,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSave: (data: { id?: string; name: string; avatar: string }) => void;
  avatars: Avatar[];
  initialData?: {
    id?: string;
    name: string;
    avatar: string;
  } | null;
}) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState("Book");
  const [search, setSearch] = useState("");

  // 🔍 Filter avatars
  const filtered = useMemo(() => {
    return avatars.filter((a) =>
      a.id.toLowerCase().includes(search.toLowerCase()),
    );
  }, [search, avatars]);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setAvatar(initialData.avatar);
    } else {
      setName("");
      setAvatar("Book");
    }
  }, [initialData]);

  // ⌨️ Keyboard controls
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!open) return;

      if (e.key === "Enter") {
        if (step === 1 && name.trim()) setStep(2);
        else if (step === 2) handleSave();
      }

      if (e.key === "Escape") {
        onOpenChange(false);
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [step, name, open]);

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({
      id: initialData?.id,
      name,
      avatar,
    });
    onOpenChange(false);
    setStep(1);
    setName("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-neutral-900 border-white/10 rounded-3xl p-8">
        {/* HEADER */}
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-2xl">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            Create your space
          </DialogTitle>
        </DialogHeader>

        {/* 📊 Progress */}
        <div className="flex gap-2 mt-4">
          {[1, 2].map((s) => (
            <div
              key={s}
              className={`h-1 flex-1 rounded-full ${
                step >= s ? "bg-white" : "bg-white/10"
              }`}
            />
          ))}
        </div>

        {/* STEP 1 */}
        {step === 1 && (
          <div className="space-y-6 mt-6">
            <Input
              autoFocus
              placeholder="Enclave name..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-black/50 border-white/10 h-12 rounded-xl"
            />

            <Button
              onClick={() => setStep(2)}
              disabled={!name.trim()}
              className="w-full h-12 rounded-xl bg-white text-black"
            >
              Continue
            </Button>
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div className="flex flex-col mt-6 max-h-[60vh]">
            {/* SEARCH */}
            <Input
              placeholder="Search icons..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="mb-4 bg-black/50 border-white/10"
            />

            {/* GRID */}
            <div className="flex-1 overflow-y-auto pr-2">
              <div className="grid grid-cols-3 gap-3">
                {filtered.map((act) => {
                  const Icon = act.icon;
                  const selected = avatar === act.id;

                  return (
                    <button
                      key={act.id}
                      onClick={() => setAvatar(act.id)}
                      className={`p-4 rounded-2xl border transition ${
                        selected
                          ? "bg-white/10 border-white/30"
                          : "bg-black/40 border-white/5 hover:bg-white/5"
                      }`}
                    >
                      <Icon
                        className={`w-6 h-6 mx-auto mb-2 ${selected ? act.color : "text-neutral-500"}`}
                      />
                      <span className="text-xs block text-center">
                        {act.id}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ACTIONS */}
            <div className="flex gap-3 pt-4 border-t border-white/10 mt-4">
              <Button variant="ghost" onClick={() => setStep(1)}>
                Back
              </Button>

              <Button onClick={handleSave} className="flex-1">
                Save
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
