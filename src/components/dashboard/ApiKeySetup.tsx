"use client";

import { useState } from "react";
import { KeyRound, ExternalLink, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg space-y-6">
        <div className="text-center">
          <div className="mx-auto h-14 w-14 rounded-2xl bg-indigo-600 flex items-center justify-center mb-4">
            <KeyRound className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Claude Org Dashboard</h1>
          <p className="mt-2 text-gray-500">
            Enter your Anthropic Admin API key to view your organization&apos;s usage data.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Admin API Key</CardTitle>
            <CardDescription>
              Your key starts with{" "}
              <code className="bg-gray-100 px-1 py-0.5 rounded text-xs">sk-ant-admin-</code>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Input
                type="password"
                placeholder="sk-ant-admin-..."
                value={key}
                onChange={(e) => { setKey(e.target.value); setStatus("idle"); }}
                onKeyDown={(e) => e.key === "Enter" && handleValidate()}
                className="pr-10 font-mono text-sm"
              />
              {status === "valid" && (
                <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
              )}
              {status === "invalid" && (
                <XCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-red-500" />
              )}
            </div>

            {status === "invalid" && (
              <p className="text-sm text-red-600 flex items-center gap-1.5">
                <XCircle className="h-3.5 w-3.5 shrink-0" />
                {errorMsg}
              </p>
            )}
            {status === "valid" && (
              <p className="text-sm text-green-600 flex items-center gap-1.5">
                <CheckCircle className="h-3.5 w-3.5 shrink-0" />
                Key validated — loading dashboard...
              </p>
            )}

            <Button
              variant="primary"
              className="w-full"
              onClick={handleValidate}
              disabled={!key.trim() || validating}
            >
              {validating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Validating...
                </>
              ) : (
                "Connect to Organization"
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">How to get your Admin API key</h3>
            <ol className="space-y-2 text-sm text-gray-600 list-decimal list-inside">
              <li>
                Go to{" "}
                <a
                  href="https://console.anthropic.com/settings/admin-keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:underline inline-flex items-center gap-0.5"
                >
                  Anthropic Console → Admin Keys
                  <ExternalLink className="h-3 w-3" />
                </a>
              </li>
              <li>Click &quot;Create Admin Key&quot;</li>
              <li>Copy the key (it starts with <code className="bg-gray-100 px-1 py-0.5 rounded text-xs">sk-ant-admin-</code>)</li>
              <li>Paste it above and click Connect</li>
            </ol>
            <p className="mt-3 text-xs text-gray-400">
              Your key is stored locally in this browser only and never sent to any third-party servers.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
