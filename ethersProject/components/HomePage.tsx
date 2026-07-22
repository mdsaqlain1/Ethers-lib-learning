import { Link } from "react-router-dom";
// Import the hook instead of static variables
import { useWallet, CF_CONTRACT_ADDRESS } from "../Provider.jsx";

const HomePage = () => {
  // Destructure what you need from the context
  const { address, cfContract, connectWallet, disconnectWallet } = useWallet();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white">
      <nav className="flex justify-between items-center px-10 py-6 backdrop-blur-lg">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
          CrowdFund
        </h1>

        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-gray-400 text-sm">Connected Wallet</p>
            <p className="font-mono text-cyan-300">
              {address
                ? `${address.slice(0, 6)}...${address.slice(-4)}`
                : "Not Connected"}
            </p>
          </div>
          
          {address ? (
            <button 
              onClick={disconnectWallet}
              className="px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/30"
            >
              Disconnect
            </button>
          ) : (
            <button 
              onClick={connectWallet}
              className="px-4 py-2 bg-cyan-500 text-slate-950 rounded-lg hover:bg-cyan-400"
            >
              Connect Wallet
            </button>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-10 py-20 grid lg:grid-cols-2 gap-16 items-center">
        {/* Left */}
        <div>
          <span className="px-4 py-2 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
            Web3 Crowdfunding Platform
          </span>

          <h1 className="text-6xl font-extrabold leading-tight mt-8">
            Turn Ideas into
            <span className="block bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500 bg-clip-text text-transparent">
              Reality.
            </span>
          </h1>

          <p className="mt-8 text-lg text-gray-300 leading-8">
            CrowdFund is a decentralized crowdfunding platform powered by
            blockchain technology. Launch fundraising campaigns, contribute
            securely with cryptocurrency, and ensure complete transparency
            through smart contracts.
          </p>

          <div className="flex flex-wrap gap-4 mt-10">
            <Link to="/create">
              <button className="px-8 py-4 rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-200 hover:bg-indigo-500/40 transition text-lg font-semibold">
                Launch
              </button>
            </Link>

            <Link to="/allcampaigns">
              <button className="px-8 py-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 transition text-lg font-semibold shadow-lg shadow-cyan-500/30 text-slate-950">
                Explore
              </button>
            </Link>

            <Link to="/mycampaigns">
              <button className="px-8 py-4 rounded-xl border border-white/20 hover:bg-white/10 transition text-lg">
                My Campaigns
              </button>
            </Link>
          </div>
        </div>

        {/* Right */}
        <div className="relative flex justify-center">
          <div className="absolute w-80 h-80 rounded-full bg-cyan-500 blur-[120px] opacity-30"></div>

          <div className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8 w-full max-w-md shadow-2xl">
            <h2 className="text-2xl font-bold mb-6">
              Why Choose CrowdFund?
            </h2>

            <div className="space-y-5">
              <div className="rounded-xl bg-slate-800/60 p-5">
                <h3 className="font-semibold text-cyan-300">
                  🔒 Transparent
                </h3>
                <p className="text-gray-400 mt-2">
                  Every donation is stored on the blockchain and can be
                  verified publicly.
                </p>
              </div>

              <div className="rounded-xl bg-slate-800/60 p-5">
                <h3 className="font-semibold text-purple-300">
                  ⚡ Fast & Secure
                </h3>
                <p className="text-gray-400 mt-2">
                  Smart contracts eliminate middlemen and keep funds secure.
                </p>
              </div>

              <div className="rounded-xl bg-slate-800/60 p-5">
                <h3 className="font-semibold text-pink-300">
                  🌍 Global Access
                </h3>
                <p className="text-gray-400 mt-2">
                  Support creators from anywhere in the world using crypto.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-6xl mx-auto px-10 py-10">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="rounded-2xl bg-white/5 backdrop-blur-xl p-8 border border-white/10 text-center">
            <h2 className="text-4xl font-bold text-cyan-400">100%</h2>
            <p className="text-gray-400 mt-2">Blockchain Transparency</p>
          </div>

          <div className="rounded-2xl bg-white/5 backdrop-blur-xl p-8 border border-white/10 text-center">
            <h2 className="text-4xl font-bold text-purple-400">24/7</h2>
            <p className="text-gray-400 mt-2">Global Accessibility</p>
          </div>

          <div className="rounded-2xl bg-white/5 backdrop-blur-xl p-8 border border-white/10 text-center">
            <h2 className="text-4xl font-bold text-pink-400">0</h2>
            <p className="text-gray-400 mt-2">Middlemen Required</p>
          </div>
        </div>
      </section>

      {/* Wallet Information */}
      <footer className="max-w-6xl mx-auto px-10 py-12">
        <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6">
          <h2 className="text-xl font-semibold mb-4">
            Connection Information
          </h2>

          <p className="text-gray-300 break-all">
            <span className="font-semibold text-cyan-300">
              Connected Wallet:
            </span>{" "}
            {address || "Not Connected"}
          </p>

          <p className="text-gray-300 break-all mt-3">
            <span className="font-semibold text-cyan-300">
              Smart Contract:
            </span>{" "}
            0xE3e51aa40B24756f0268df489789B8a4f4D48A78
          </p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;