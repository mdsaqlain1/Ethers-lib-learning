import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { useParams } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { useWallet } from "../Provider.jsx"; // <-- Import the hook here

type CampaignType = {
  title: string;
  description: string;
  creator: string;
  goal: string;
  pledged: string;
  startAt: string;
  endAt: string;
  claimed: boolean;
};

function Campaign() {
  const { id } = useParams();
  
  // Extract wallet info from Context
  const { address, cfContract, connectWallet } = useWallet();

  const [campaign, setCampaign] = useState<CampaignType | null>(null);
  const [contributionAmount, setContributionAmount] = useState("");

  // Separate loading states
  const [isContributing, setIsContributing] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [isUnpledging, setIsUnpledging] = useState(false);
  const [isRefunding, setIsRefunding] = useState(false);

  // Helper to disable inputs/buttons if ANY transaction is running
  const isAnyLoading =
    isContributing || isClaiming || isUnpledging || isRefunding;

  useEffect(() => {
    const fetchCampaign = async () => {
      if (!cfContract) return; // Wait until contract is available

      try {
        const totalCampaigns = await cfContract.count();

        // Optimized: Directly fetch the campaign instead of looping
        if (Number(id) > 0 && Number(id) <= Number(totalCampaigns)) {
          const camp = await cfContract.campaigns(Number(id));

          setCampaign({
            title: camp.title,
            description: camp.description,
            creator: camp.creator,
            goal: ethers.formatEther(camp.goal),
            pledged: ethers.formatEther(camp.pledged),
            startAt: camp.startAt.toString(),
            endAt: camp.endAt.toString(),
            claimed: camp.claimed,
          });
        } else {
          toast.error("Campaign not found.");
        }
      } catch (error: any) {
        console.error("Error fetching campaign:", error);
        toast.error("Failed to load campaign data.");
      }
    };

    fetchCampaign();
  }, [id, cfContract]); // Re-run if ID changes or wallet connects

  const remainingSeconds = campaign?.endAt
    ? Math.max(0, Number(campaign.endAt) - Math.floor(Date.now() / 1000))
    : 0;

  const daysLeft = Math.floor(remainingSeconds / (60 * 60 * 24));
  const hoursLeft = Math.floor((remainingSeconds % (60 * 60 * 24)) / (60 * 60));

  const progressPercentage = Math.min(
    ((campaign?.pledged ? Number(campaign.pledged) : 0) /
      (campaign?.goal ? Number(campaign.goal) : 1)) *
      100,
    100
  );

  const handleContribute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contributionAmount || !cfContract) return;

    setIsContributing(true);

    try {
      const tx = await cfContract.pledge(Number(id), {
        value: ethers.parseEther(contributionAmount),
      });

      toast.loading("Transaction pending...", { id: "tx-toast" });
      await tx.wait();

      const updatedCampaign = await cfContract.campaigns(Number(id));
      setCampaign((prev) => prev ? {
        ...prev,
        pledged: ethers.formatEther(updatedCampaign.pledged),
      } : null);

      setContributionAmount("");
      toast.success("Successfully contributed!", { id: "tx-toast" });
    } catch (error: any) {
      console.error("Transaction failed:", error);
      const errorMessage = error.reason || error.message || "Transaction failed";
      toast.error(errorMessage, { id: "tx-toast" });
    } finally {
      setIsContributing(false);
    }
  };

  const handleClaim = async () => {
    if (!cfContract) return;
    setIsClaiming(true);

    try {
      const tx = await cfContract.claim(Number(id));
      toast.loading("Processing claim...", { id: "claim-toast" });

      await tx.wait();
      toast.success("Funds claimed successfully!", { id: "claim-toast" });

      if (campaign) {
        setCampaign({ ...campaign, claimed: true });
      }
    } catch (error: any) {
      console.error("Claim failed:", error);
      const errorMessage = error.reason || error.message || "Claim failed";
      toast.error(errorMessage, { id: "claim-toast" });
    } finally {
      setIsClaiming(false);
    }
  };

  const handleUnpledge = async () => {
    if (!contributionAmount || !cfContract) {
      toast.error("Please enter the amount you want to unpledge.");
      return;
    }

    setIsUnpledging(true);

    try {
      const tx = await cfContract.unpledge(
        Number(id),
        ethers.parseEther(contributionAmount)
      );
      toast.loading("Processing unpledge...", { id: "unpledge-toast" });

      await tx.wait();

      const updatedCampaign = await cfContract.campaigns(Number(id));
      setCampaign((prev) => prev ? {
        ...prev,
        pledged: ethers.formatEther(updatedCampaign.pledged),
      } : null);

      setContributionAmount("");
      toast.success("Funds unpledged successfully!", { id: "unpledge-toast" });
    } catch (error: any) {
      console.error("Unpledge failed:", error);
      const errorMessage = error.reason || error.message || "Unpledge failed";
      toast.error(errorMessage, { id: "unpledge-toast" });
    } finally {
      setIsUnpledging(false);
    }
  };

  const handleRefund = async () => {
    if (!cfContract) return;
    setIsRefunding(true);

    try {
      const tx = await cfContract.refund(Number(id));
      toast.loading("Processing refund...", { id: "refund-toast" });

      await tx.wait();

      const updatedCampaign = await cfContract.campaigns(Number(id));
      setCampaign((prev) => prev ? {
        ...prev,
        pledged: ethers.formatEther(updatedCampaign.pledged),
      } : null);

      toast.success("Refund processed successfully!", { id: "refund-toast" });
    } catch (error: any) {
      console.error("Refund failed:", error);
      const errorMessage = error.reason || error.message || "Refund failed";
      toast.error(errorMessage, { id: "refund-toast" });
    } finally {
      setIsRefunding(false);
    }
  };

  // --- UI FALLBACK: If wallet is not connected ---
  if (!cfContract || !address) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white flex items-center justify-center px-6">
        <div className="text-center backdrop-blur-xl bg-white/5 border border-white/10 p-10 rounded-3xl shadow-2xl max-w-md w-full">
          <h2 className="text-2xl font-bold mb-4">Wallet Not Connected</h2>
          <p className="text-gray-400 mb-8">
            Please connect your wallet to view and interact with this campaign.
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

  // --- UI FALLBACK: Loading campaign data ---
  if (!campaign) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white px-6 py-10">
      <Toaster position="bottom-right" reverseOrder={false} />

      <div className="max-w-5xl mx-auto">
        <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl p-8">
          {/* Header */}
          <div className="mb-8">
            <span className="inline-block px-4 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-sm">
              Campaign #{id}
            </span>

            <h1 className="mt-5 text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
              {campaign.title}
            </h1>

            <p className="mt-4 text-gray-300 leading-relaxed">
              {campaign.description}
            </p>

            <div className="mt-6">
              <p className="text-sm text-gray-400">Created By</p>
              <p className="font-mono break-all text-purple-300">
                {campaign.creator}
              </p>
            </div>
          </div>

          {/* Progress */}
          <div className="mb-10">
            <div className="flex justify-between mb-3">
              <span className="text-gray-300">
                {campaign.pledged} ETH Raised
              </span>

              <span className="text-cyan-300">Goal {campaign.goal} ETH</span>
            </div>

            <div className="h-3 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 transition-all duration-700"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>

          {/* Stats */}
          <div className="grid md:grid-cols-3 gap-6 mb-10">
            <div className="rounded-2xl bg-white/5 border border-white/10 p-6 text-center min-h-[170px] flex flex-col justify-center">
              <p className="text-2xl lg:text-3xl font-bold text-green-400 break-all">
                {campaign.pledged}
              </p>
              <p className="text-gray-400 mt-3">ETH Raised</p>
            </div>

            <div className="rounded-2xl bg-white/5 border border-white/10 p-6 text-center min-h-[170px] flex flex-col justify-center">
              <p className="text-2xl lg:text-3xl font-bold text-cyan-400 break-all">
                {campaign.goal}
              </p>
              <p className="text-gray-400 mt-3">Funding Goal</p>
            </div>

            <div className="rounded-2xl bg-white/5 border border-white/10 p-6 text-center min-h-[170px] flex flex-col justify-center">
              <p className="text-3xl font-bold text-purple-400">
                {daysLeft}d {hoursLeft}h
              </p>
              <p className="text-gray-400 mt-3">Time Left</p>
            </div>
          </div>

          {/* Contribution */}
          <form
            onSubmit={handleContribute}
            className="rounded-2xl border border-white/10 bg-white/5 p-6"
          >
            <h2 className="text-xl font-semibold mb-6">
              Support this Campaign
            </h2>

            <div className="flex flex-col md:flex-row gap-4 flex-wrap">
              <div className="relative flex-1 min-w-[200px]">
                <input
                  type="number"
                  step="any"
                  min="0"
                  value={contributionAmount}
                  onChange={(e) => setContributionAmount(e.target.value)}
                  placeholder="Enter ETH amount"
                  disabled={isAnyLoading}
                  className="w-full rounded-xl bg-slate-900/70 border border-white/10 px-5 py-4 outline-none focus:border-cyan-400 text-white placeholder:text-gray-500"
                />

                <span className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400">
                  ETH
                </span>
              </div>

              <button
                type="submit"
                disabled={isAnyLoading || !contributionAmount}
                className="rounded-xl px-7 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 font-semibold transition disabled:opacity-50"
              >
                {isContributing ? "Processing..." : "Contribute"}
              </button>

              <button
                type="button"
                onClick={handleUnpledge}
                disabled={isAnyLoading || !contributionAmount}
                className="rounded-xl px-7 py-4 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-400 hover:to-rose-500 font-semibold transition disabled:opacity-50"
              >
                {isUnpledging ? "Processing..." : "Unpledge"}
              </button>

              {/* Refund Button rendered conditionally based on ETH raised > goal */}
              {Number(campaign.pledged) > Number(campaign.goal) && (
                <button
                  type="button"
                  onClick={handleRefund}
                  disabled={isAnyLoading}
                  className="rounded-xl px-7 py-4 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-400 hover:to-amber-500 font-semibold transition disabled:opacity-50"
                >
                  {isRefunding ? "Processing..." : "Refund"}
                </button>
              )}

              {address.toLowerCase() === campaign.creator.toLowerCase() && (
                <button
                  type="button"
                  onClick={handleClaim}
                  disabled={isAnyLoading || campaign.claimed}
                  className="rounded-xl px-7 py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 font-semibold transition disabled:opacity-50"
                >
                  {isClaiming
                    ? "Processing..."
                    : campaign.claimed
                      ? "Claimed"
                      : "Claim Funds"}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Campaign;