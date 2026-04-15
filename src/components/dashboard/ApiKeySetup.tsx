"use client";

import { useState } from "react";
import { ExternalLink, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { KWLogo } from "@/components/ui/KWLogo";

interface ApiKeySetupProps {
  onSave: (key: string) => void;
  currentKey?: string;
}

export function ApiKeySetup({ onSave, currentKey }: ApiKeySetupProps) {
  const [key, setKey] = useState(currentKey ?? "");
  const [validating, setValidating] = useState(false);
  const [status, setStatus] = useState<"idle" | "valid" | "invalid">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleValidate = async () => {
    if (!key.trim()) return;
    setValidating(true);
    setStatus("idle");
    try {
      const res = await fetch("/api/validate-key", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ adminKey: key.trim() }),
      });
      const data = await res.json();
      if (data.valid) {
        setStatus("valid");
        onSave(key.trim());
      } else {
        setStatus("invalid");
        setErrorMsg(data.error ?? "Invalid key");
      }
    } catch {
      setStatus("invalid");
      setErrorMsg("Connection error");
    } finally {
      setValidating(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[color:var(--kw-bg)]">
      {/* Hero: dark-green signature grid with floating dots */}
      <div className="relative overflow-hidden kw-grid text-white">
        {/* Decorative brand dot cluster */}
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <span
            className="kw-dot absolute top-16 right-24 h-3 w-3"
            style={{ color: "#FFB500" }}
          />
          <span
            className="kw-dot absolute top-28 right-48 h-2 w-2"
            style={{ color: "#FFD166" }}
          />
          <span
            className="kw-dot absolute top-12 right-80 h-1.5 w-1.5"
            style={{ color: "#FFB500" }}
          />
          <span
            className="kw-dot absolute top-40 right-16 h-4 w-4"
            style={{ color: "#FFB500" }}
          />
          <span
            className="kw-dot absolute bottom-16 left-24 h-2 w-2"
            style={{ color: "#8FE0BF" }}
          />
          <span
            className="kw-dot absolute bottom-10 left-48 h-3 w-3"
            style={{ color: "#8FE0BF" }}
          />
        </div>

        <div className="relative max-w-3xl mx-auto px-6 pt-16 pb-20 sm:pt-24 sm:pb-28 text-center">
          <KWLogo
            variant="mark"
            className="h-16 w-16 text-2xl mx-auto mb-8 shadow-[0_12px_40px_-12px_rgba(255,181,0,0.5)]"
          />
          <h1 className="font-heading font-bold text-4xl sm:text-5xl tracking-tight leading-[1.1]">
            See how{" "}
            <span
              className="font-serif italic font-normal"
              style={{ color: "var(--kw-yellow)" }}
            >
              Kindness
            </span>{" "}
            <br className="hidden sm:block" />
            scales across your org.
          </h1>
          <p className="mt-5 text-lg text-white/75 max-w-xl mx-auto leading-relaxed">
            Monitor Claude usage, costs, and spend limits for every member of your
            KindWorks organization — in one calm, friendly dashboard.
          </p>
        </div>
      </div>

      {/* API key card floats over the transition */}
      <div className="max-w-lg w-full mx-auto px-4 -mt-14 pb-16">
        <Card>
          <CardHeader className="pb-4">
            <CardTitle>Connect your organization</CardTitle>
            <CardDescription>
              Enter your Anthropic Admin API key — it starts with{" "}
              <code className="bg-[color:var(--kw-green)]/8 text-[color:var(--kw-green-dark)] px-1.5 py-0.5 rounded-md text-xs font-mono">
                sk-ant-admin-
              </code>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Input
                type="password"
                placeholder="sk-ant-admin-..."
                value={key}
                onChange={(e) => {
                  setKey(e.target.value);
                  setStatus("idle");
                }}
                onKeyDown={(e) => e.key === "Enter" && handleValidate()}
                className="pr-11 font-mono text-sm"
                autoFocus
              />
              {status === "valid" && (
                <CheckCircle className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[color:var(--kw-mint-dark)]" />
              )}
              {status === "invalid" && (
                <XCircle className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[color:var(--kw-coral)]" />
              )}
            </div>

            {status === "invalid" && (
              <p className="text-sm text-[color:var(--kw-coral)] flex items-start gap-1.5">
                <XCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                <span className="break-all">{errorMsg}</span>
              </p>
            )}
            {status === "valid" && (
              <p className="text-sm text-[color:var(--kw-mint-dark)] flex items-center gap-1.5">
                <CheckCircle className="h-3.5 w-3.5 shrink-0" />
                Key validated — loading your dashboard…
              </p>
            )}

            <Button
              variant="primary"
              size="lg"
              className="w-full"
              onClick={handleValidate}
              disabled={!key.trim() || validating}
            >
              {validating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Validating…
                </>
              ) : (
                "Connect to Organization"
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Helper card */}
        <Card className="mt-4 bg-[color:var(--kw-mint)]/25 border-[color:var(--kw-mint-dark)]/30">
          <CardContent className="pt-7">
            <h3 className="font-heading font-bold text-[color:var(--kw-green-dark)] mb-3 flex items-center gap-2">
              <span
                className="kw-dot h-2 w-2"
                style={{ color: "var(--kw-green-dark)" }}
              />
              How to get your Admin API key
            </h3>
            <ol className="space-y-2 text-sm text-[color:var(--kw-green-dark)] list-decimal list-inside pl-1">
              <li>
                Go to{" "}
                <a
                  href="https://console.anthropic.com/settings/admin-keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2 hover:text-[color:var(--kw-coral)] inline-flex items-center gap-0.5 font-medium"
                >
                  Anthropic Console → Admin Keys
                  <ExternalLink className="h-3 w-3" />
                </a>
              </li>
              <li>Click &quot;Create Admin Key&quot;</li>
              <li>
                Copy the key (starts with{" "}
                <code className="bg-white/60 px-1 py-0.5 rounded text-xs font-mono">
                  sk-ant-admin-
                </code>
                )
              </li>
              <li>Paste it above and click Connect</li>
            </ol>
            <p className="mt-4 text-xs text-[color:var(--kw-green-dark)]/70 leading-relaxed">
              Your key is stored locally in this browser only — it&apos;s never sent
              anywhere except directly to Anthropic.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
