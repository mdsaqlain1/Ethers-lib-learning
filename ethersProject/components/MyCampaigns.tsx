import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ethers } from "ethers"; // Added to use formatEther safely
import { useWallet } from "../Provider.jsx"; // <-- Import the hook here

type Campaign = {
  id: number;
  title: string;
  description: string;
  creator: string;
  goal: string;
  pledged: string;
  startAt: string;
  endAt: string;
  claimed: boolean;
};

const MyCampaigns = () => {
  // Extract wallet info from Context
  const { address, cfContract, connectWallet } = useWallet();

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyCampaigns = async () => {
      // Don't attempt to fetch if contract or address isn't loaded yet
      if (!cfContract || !address) return;

      try {
        setLoading(true);
        const userAddress = address.toLowerCase();
        const total = Number(await cfContract.count());

        const myCampaigns: Campaign[] = [];

        for (let i = 1; i <= total; i++) {
          const campaign = await cfContract.campaigns(i);

          if (campaign.creator.toLowerCase() === userAddress) {
            myCampaigns.push({
              id: i,
              title: campaign.title,
              description: campaign.description,
              creator: campaign.creator,
              // Cleaned up conversion using ethers.formatEther
              goal: ethers.formatEther(campaign.goal), 
              pledged: ethers.formatEther(campaign.pledged), 
              startAt: new Date(Number(campaign.startAt) * 1000).toLocaleDateString(),
              endAt: new Date(Number(campaign.endAt) * 1000).toLocaleDateString(),
              claimed: campaign.claimed,
            });
          }
        }

        setCampaigns(myCampaigns);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMyCampaigns();
  }, [cfContract, address]); // Re-run if wallet context changes

  // --- UI FALLBACK: If wallet is not connected ---
  if (!address || !cfContract) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white flex items-center justify-center px-6">
        <div className="text-center backdrop-blur-xl bg-white/5 border border-white/10 p-10 rounded-3xl shadow-2xl max-w-md w-full">
          <h2 className="text-2xl font-bold mb-4">Wallet Not Connected</h2>
          <p className="text-gray-400 mb-8">
            Please connect your wallet to view your campaigns.
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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white px-8 py-12">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
            My Campaigns
          </h1>

          <p className="text-gray-400 mt-3 text-lg">
            View and manage all the campaigns you've created.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="h-12 w-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : campaigns.length === 0 ? (
          <div className="text-center mt-24">
            <h2 className="text-3xl font-semibold text-gray-300">
              No Campaigns Found
            </h2>
            <p className="text-gray-500 mt-3">
              You haven't created any campaigns yet.
            </p>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-8">
            {campaigns.map((campaign) => (
              <div
                key={campaign.id}
                className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-7 hover:border-cyan-400/50 hover:-translate-y-2 transition-all duration-300 shadow-xl"
              >
                <div className="flex justify-between items-center">
                  <span className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-sm">
                    Campaign #{campaign.id}
                  </span>

                  <span
                    className={`text-xs px-3 py-1 rounded-full ${
                      campaign.claimed
                        ? "bg-green-500/20 text-green-300"
                        : "bg-yellow-500/20 text-yellow-300"
                    }`}
                  >
                    {campaign.claimed ? "Claimed" : "Active"}
                  </span>
                </div>

                <h2 className="text-2xl font-bold mt-6">
                  {campaign.title}
                </h2>

                <p className="text-gray-400 mt-4 line-clamp-3">
                  {campaign.description}
                </p>

                <div className="mt-6 space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Goal</span>
                    <span className="font-semibold text-cyan-300">
                      {campaign.goal} ETH
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-400">Raised</span>
                    <span className="font-semibold text-green-300">
                      {campaign.pledged} ETH
                    </span>
                  </div>

                  <div>
                    <p className="text-gray-400">Creator</p>
                    <p className="font-mono text-sm break-all text-purple-300">
                      {campaign.creator}
                    </p>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-400">Starts</span>
                    <span>{campaign.startAt}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-400">Ends</span>
                    <span>{campaign.endAt}</span>
                  </div>
                </div>

                <Link to={`/campaign/${campaign.id}`}>
                  <button className="w-full mt-8 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 py-3 rounded-xl font-semibold transition duration-300 shadow-lg shadow-cyan-500/30">
                    Manage Campaign
                  </button>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyCampaigns;