import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useWallet } from "../Provider.jsx";

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

const AllCampaign = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const { address, cfContract, connectWallet } = useWallet();

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const total = Number(await cfContract.count());

        const list: Campaign[] = [];

        for (let i = 1; i <= total; i++) {
          const campaign = await cfContract.campaigns(i);

          list.push({
            id: i,
            title: campaign.title,
            description: campaign.description,
            creator: campaign.creator,
            goal: campaign.goal.toString(),
            pledged: campaign.pledged.toString(),
            startAt: new Date(
              Number(campaign.startAt) * 1000
            ).toLocaleDateString(),
            endAt: new Date(
              Number(campaign.endAt) * 1000
            ).toLocaleDateString(),
            claimed: campaign.claimed,
          });
        }

        setCampaigns(list);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCampaigns();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white px-8 py-12">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
            Explore Campaigns
          </h1>

          <p className="text-gray-400 mt-3 text-lg">
            Discover and support decentralized crowdfunding projects.
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
              Be the first one to create a campaign.
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
                    View Details
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

export default AllCampaign;