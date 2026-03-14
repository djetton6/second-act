"use client";
import { useState } from "react";
import { X, Gavel, Star, AlertCircle, CheckCircle2, Home, HardHat } from "lucide-react";
import { ChicagoProperty } from "@/types";

interface BidModalProps {
  property: ChicagoProperty;
  onClose: () => void;
  onBidSuccess: (amount: number) => void;
}

export default function BidModal({ property, onClose, onBidSuccess }: BidModalProps) {
  const [step, setStep] = useState<"form" | "confirm" | "success">("form");
  const [form, setForm] = useState({
    name: "",
    email: "",
    zip: "",
    amount: property.currentBid ? property.currentBid + 1000 : property.minBid,
    proposalType: "renovation" as "renovation" | "new_construction",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isLocalResident = form.zip === property.zip;

  async function handleSubmit() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/bid", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyId: property.id,
          bidderName: form.name,
          bidderEmail: form.email,
          bidderZip: form.zip,
          amount: form.amount,
          proposalType: form.proposalType,
          message: form.message,
          propertyZip: property.zip,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Bid failed");
      setStep("success");
      onBidSuccess(form.amount);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to submit bid");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-[#0f1629] border border-[#1a3a6e]/60 rounded-2xl w-full max-w-lg shadow-2xl shadow-black/60">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#1a3a6e]/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#003087]/40 rounded-xl flex items-center justify-center">
              <Gavel size={18} className="text-[#4a90d9]" />
            </div>
            <div>
              <h2 className="text-white font-bold text-lg">Place a Bid</h2>
              <p className="text-zinc-400 text-xs">{property.address}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-zinc-500 hover:text-white transition-colors rounded-lg hover:bg-[#1a3a6e]/30">
            <X size={18} />
          </button>
        </div>

        {step === "form" && (
          <div className="p-6 space-y-4">
            {/* Local resident notice */}
            <div className="bg-[#003087]/20 border border-[#1a6eb5]/30 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <Star size={14} className="text-[#4a90d9]" fill="currentColor" />
                <span className="text-[#4a90d9] text-sm font-semibold">Local Resident Priority</span>
              </div>
              <p className="text-zinc-300 text-xs">
                Residents of ZIP <strong>{property.zip}</strong> ({property.neighborhood}) receive priority
                consideration when bidding on this property.
              </p>
            </div>

            {/* Form fields */}
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Your full name"
                  className="w-full bg-[#0a0e1a] border border-[#1a3a6e]/50 rounded-xl px-4 py-2.5 text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-[#1a6eb5]/70"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="you@example.com"
                  className="w-full bg-[#0a0e1a] border border-[#1a3a6e]/50 rounded-xl px-4 py-2.5 text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-[#1a6eb5]/70"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                  Your ZIP Code
                  {isLocalResident && (
                    <span className="ml-2 text-[#4a90d9] font-semibold">★ Local!</span>
                  )}
                </label>
                <input
                  type="text"
                  value={form.zip}
                  onChange={(e) => setForm({ ...form, zip: e.target.value })}
                  placeholder="60601"
                  maxLength={5}
                  className={`w-full bg-[#0a0e1a] border rounded-xl px-4 py-2.5 text-white text-sm placeholder-zinc-600 focus:outline-none transition-colors ${
                    isLocalResident
                      ? "border-[#1a6eb5] ring-1 ring-[#1a6eb5]/30"
                      : "border-[#1a3a6e]/50 focus:border-[#1a6eb5]/70"
                  }`}
                />
              </div>
            </div>

            {/* Proposal type */}
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-2">Proposal Type</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setForm({ ...form, proposalType: "renovation" })}
                  className={`flex items-center gap-2 p-3 rounded-xl border text-sm transition-all ${
                    form.proposalType === "renovation"
                      ? "bg-[#003087]/40 border-[#1a6eb5]/60 text-white"
                      : "bg-[#0a0e1a] border-[#1a3a6e]/40 text-zinc-400 hover:text-white hover:border-[#1a3a6e]/60"
                  }`}
                >
                  <Home size={16} />
                  Renovation
                </button>
                <button
                  onClick={() => setForm({ ...form, proposalType: "new_construction" })}
                  className={`flex items-center gap-2 p-3 rounded-xl border text-sm transition-all ${
                    form.proposalType === "new_construction"
                      ? "bg-[#003087]/40 border-[#1a6eb5]/60 text-white"
                      : "bg-[#0a0e1a] border-[#1a3a6e]/40 text-zinc-400 hover:text-white hover:border-[#1a3a6e]/60"
                  }`}
                >
                  <HardHat size={16} />
                  New Build
                </button>
              </div>
            </div>

            {/* Bid amount */}
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                Bid Amount
                <span className="ml-2 text-zinc-500">Min: ${property.minBid.toLocaleString()}</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 font-semibold">$</span>
                <input
                  type="number"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: parseInt(e.target.value) || 0 })}
                  min={property.minBid}
                  step={1000}
                  className="w-full bg-[#0a0e1a] border border-[#1a3a6e]/50 rounded-xl pl-8 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#1a6eb5]/70"
                />
              </div>
              {form.amount > 0 && (
                <div className="mt-1.5 flex items-center gap-4 text-xs text-zinc-500">
                  <span className="text-emerald-400 font-medium">
                    {Math.round(((property.estimatedValue - form.amount) / property.estimatedValue) * 100)}% below est. value
                  </span>
                  {property.currentBid && form.amount <= property.currentBid && (
                    <span className="text-red-400">Below current bid of ${property.currentBid.toLocaleString()}</span>
                  )}
                </div>
              )}
            </div>

            {/* Message */}
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">Community Proposal <span className="text-zinc-600">(optional)</span></label>
              <textarea
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder="Describe your vision for this property and how it will benefit the community..."
                rows={3}
                className="w-full bg-[#0a0e1a] border border-[#1a3a6e]/50 rounded-xl px-4 py-2.5 text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-[#1a6eb5]/70 resize-none"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-400 text-sm bg-red-900/20 border border-red-700/30 rounded-xl px-4 py-3">
                <AlertCircle size={15} />
                {error}
              </div>
            )}

            <button
              onClick={() => setStep("confirm")}
              disabled={!form.name || !form.email || !form.zip || form.amount < property.minBid}
              className="w-full bg-gradient-to-r from-[#003087] to-[#1a6eb5] hover:from-[#003087]/90 hover:to-[#1a6eb5]/90 disabled:from-zinc-700 disabled:to-zinc-700 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-all text-sm shadow-lg shadow-blue-900/20"
            >
              Review Bid — ${form.amount.toLocaleString()}
            </button>
          </div>
        )}

        {step === "confirm" && (
          <div className="p-6 space-y-4">
            <div className="bg-[#0a0e1a] rounded-2xl p-4 space-y-3">
              <h3 className="text-white font-semibold">Bid Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-zinc-400">Property</span><span className="text-white">{property.address}</span></div>
                <div className="flex justify-between"><span className="text-zinc-400">Bidder</span><span className="text-white">{form.name}</span></div>
                <div className="flex justify-between"><span className="text-zinc-400">ZIP Code</span><span className={`font-semibold ${isLocalResident ? "text-[#4a90d9]" : "text-white"}`}>{form.zip} {isLocalResident && "★ Local"}</span></div>
                <div className="flex justify-between"><span className="text-zinc-400">Proposal</span><span className="text-white capitalize">{form.proposalType.replace("_", " ")}</span></div>
                <div className="border-t border-[#1a3a6e]/40 pt-2 mt-2 flex justify-between">
                  <span className="text-zinc-300 font-semibold">Bid Amount</span>
                  <span className="text-white font-bold text-lg">${form.amount.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {isLocalResident && (
              <div className="flex items-center gap-2 text-[#4a90d9] text-sm bg-[#003087]/20 border border-[#1a6eb5]/30 rounded-xl px-4 py-3">
                <Star size={14} fill="currentColor" />
                Your bid receives <strong>local resident priority</strong> status!
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 text-red-400 text-sm bg-red-900/20 border border-red-700/30 rounded-xl px-4 py-3">
                <AlertCircle size={15} />
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setStep("form")}
                className="flex-1 border border-[#1a3a6e]/50 hover:border-[#1a6eb5]/60 text-zinc-300 hover:text-white font-semibold py-3 rounded-xl transition-all text-sm"
              >
                Edit
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-[#003087] to-[#1a6eb5] hover:from-[#003087]/90 hover:to-[#1a6eb5]/90 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition-all text-sm"
              >
                {loading ? "Submitting..." : "Confirm Bid"}
              </button>
            </div>
          </div>
        )}

        {step === "success" && (
          <div className="p-6 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 size={32} className="text-emerald-400" />
            </div>
            <div>
              <h3 className="text-white font-bold text-xl mb-2">Bid Submitted!</h3>
              <p className="text-zinc-400 text-sm">
                Your bid of <strong className="text-white">${form.amount.toLocaleString()}</strong> on{" "}
                <strong className="text-white">{property.address}</strong> has been received.
              </p>
              {isLocalResident && (
                <p className="text-[#4a90d9] text-sm mt-2 font-medium">
                  ★ Your bid has local resident priority status!
                </p>
              )}
            </div>
            <p className="text-zinc-500 text-xs">
              You&apos;ll receive a confirmation at {form.email}. The Chicago Department of Planning will review all bids.
            </p>
            <button
              onClick={onClose}
              className="w-full bg-gradient-to-r from-[#003087] to-[#1a6eb5] text-white font-bold py-3 rounded-xl transition-all text-sm"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
