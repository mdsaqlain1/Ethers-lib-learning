import React, { useState } from "react";
import { ethers } from "ethers";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast"; 
import { useWallet } from "../Provider.jsx"; // <-- Import the hook

type FormState = {
  title: string;
  description: string;
  target: string;
  startAt: string;
  endAt: string;
};

const initialState: FormState = {
  title: "",
  description: "",
  target: "",
  startAt: "",
  endAt: "",
};

export default function CreateCampaign() {
  // Extract wallet info from Context
  const { address, cfContract, connectWallet } = useWallet();

  const [form, setForm] = useState<FormState>(initialState);
  const [errors, setErrors] = useState<
    Partial<Record<keyof FormState, string>>
  >({});
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const validate = (): boolean => {
    const errs: Partial<Record<keyof FormState, string>> = {};

    if (!form.title.trim()) errs.title = "Title is required.";

    if (!form.description.trim()) errs.description = "Description is required.";

    if (!form.target.trim()) errs.target = "Target amount is required.";
    else {
      const n = Number(form.target);
      if (Number.isNaN(n) || n <= 0)
        errs.target = "Target must be a positive number.";
    }

    if (!form.startAt) errs.startAt = "Start date & time is required.";
    else if (new Date(form.startAt) < new Date())
      errs.startAt = "Start time cannot be in the past.";

    if (!form.endAt) errs.endAt = "End date & time is required.";
    else if (new Date(form.endAt) <= new Date(form.startAt))
      errs.endAt = "End time must be after the start time.";

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || !cfContract) return;

    // Trigger a loading toast
    const toastId = toast.loading("Launching your campaign...");
    setSubmitted(true);

    try {
      // Convert the ETH string to Wei (e.g. "10" becomes 10000000000000000000)
      const targetInWei = ethers.parseEther(form.target);

      const tx = await cfContract.launch(
        form.title,
        form.description,
        targetInWei, 
        Math.floor(new Date(form.startAt).getTime() / 1000), 
        Math.floor(new Date(form.endAt).getTime() / 1000)
      );

      // Wait for transaction to be mined
      await tx.wait();

      // Update the toast to success
      toast.success("Campaign created successfully!", { id: toastId });
      
      // Reset form
      setForm(initialState);
      setErrors({});

      // Redirect user to their campaigns after a brief delay
      setTimeout(() => {
        navigate("/mycampaigns");
      }, 1500);

    } catch (error) {
      console.error("Failed to launch campaign:", error);
      toast.error("Failed to create campaign. Please try again.", { id: toastId });
    } finally {
      setSubmitted(false);
    }
  };

  // --- UI FALLBACK: If wallet is not connected ---
  if (!address || !cfContract) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white flex items-center justify-center px-6">
        <div className="text-center backdrop-blur-xl bg-white/5 border border-white/10 p-10 rounded-3xl shadow-2xl max-w-md w-full">
          <h2 className="text-2xl font-bold mb-4">Wallet Not Connected</h2>
          <p className="text-gray-400 mb-8">
            Please connect your wallet to launch a new campaign.
          </p>
          <button
            onClick={connectWallet}
            className="w-full px-6 py-4 bg-cyan-500 text-slate-950 rounded-xl hover:bg-cyan-400 font-semibold transition shadow-lg shadow-cyan-500/30"
          >
            Connect Wallet
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 px-6 py-10">
      <form
        onSubmit={handleSubmit}
        noValidate
        className="max-w-3xl mx-auto rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl p-8"
      >
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
            Create New Campaign
          </h2>

          <p className="text-gray-400 mt-3">
            Launch your decentralized crowdfunding campaign on Ethereum.
          </p>
        </div>

        <div className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Campaign Title
            </label>

            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Enter campaign title"
              className="w-full rounded-xl bg-slate-900/70 border border-white/10 px-5 py-3 text-white placeholder:text-gray-500 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500 transition"
            />

            {errors.title && (
              <p className="mt-2 text-sm text-red-400">{errors.title}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Description
            </label>

            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={5}
              placeholder="Describe your campaign..."
              className="w-full rounded-xl bg-slate-900/70 border border-white/10 px-5 py-3 text-white placeholder:text-gray-500 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500 transition resize-none"
            />

            {errors.description && (
              <p className="mt-2 text-sm text-red-400">{errors.description}</p>
            )}
          </div>

          {/* Target */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Funding Goal (ETH)
            </label>

            <input
              name="target"
              value={form.target}
              onChange={handleChange}
              type="number"
              min="0"
              step="0.01"
              placeholder="10"
              className="w-full rounded-xl bg-slate-900/70 border border-white/10 px-5 py-3 text-white placeholder:text-gray-500 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500 transition"
            />

            {errors.target && (
              <p className="mt-2 text-sm text-red-400">{errors.target}</p>
            )}
          </div>

          {/* Dates */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Start Date & Time
              </label>

              <input
                type="datetime-local"
                name="startAt"
                value={form.startAt}
                onChange={handleChange}
                className="w-full rounded-xl bg-slate-900/70 border border-white/10 px-5 py-3 text-white outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500 transition"
                style={{ colorScheme: "dark" }}
              />

              {errors.startAt && (
                <p className="mt-2 text-sm text-red-400">{errors.startAt}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                End Date & Time
              </label>

              <input
                type="datetime-local"
                name="endAt"
                value={form.endAt}
                onChange={handleChange}
                className="w-full rounded-xl bg-slate-900/70 border border-white/10 px-5 py-3 text-white outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500 transition"
                style={{ colorScheme: "dark" }}
              />

              {errors.endAt && (
                <p className="mt-2 text-sm text-red-400">{errors.endAt}</p>
              )}
            </div>
          </div>

          {/* Preview */}
          <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-5">
            <h3 className="text-cyan-300 font-semibold mb-3">
              Campaign Preview
            </h3>

            <div className="space-y-2 text-gray-300">
              <p>
                <span className="text-gray-400">Title:</span>{" "}
                {form.title || "Not specified"}
              </p>

              <p>
                <span className="text-gray-400">Goal:</span>{" "}
                {form.target || "0"} ETH
              </p>

              <p>
                <span className="text-gray-400">Starts:</span>{" "}
                {form.startAt ? new Date(form.startAt).toLocaleString() : "--"}
              </p>

              <p>
                <span className="text-gray-400">Ends:</span>{" "}
                {form.endAt ? new Date(form.endAt).toLocaleString() : "--"}
              </p>
            </div>
          </div>

          {/* Button */}
          <button
            type="submit"
            disabled={submitted}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-lg font-semibold transition duration-300 shadow-lg shadow-cyan-500/30"
          >
            {submitted ? "Confirming on Blockchain..." : "🚀 Launch Campaign"}
          </button>
        </div>
      </form>
    </div>
  );
}