import { getDashboardStats } from "@/lib/api";


export default async function Home() {

  const stats = await getDashboardStats();


  return (
    <main className="min-h-screen bg-black text-white p-8">

      <h1 className="text-4xl font-bold">
        Chrona SOC 🚀
      </h1>

      <p className="text-gray-400 mt-2">
        AI-Powered Security Operations Platform
      </p>


      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-10">


        <div className="bg-gray-900 p-6 rounded-xl">
          <h2 className="text-gray-400">
            Total Alerts
          </h2>

          <p className="text-3xl font-bold mt-3">
            {stats.total_alerts}
          </p>
        </div>



        <div className="bg-gray-900 p-6 rounded-xl">
          <h2 className="text-gray-400">
            Open Alerts
          </h2>

          <p className="text-3xl font-bold mt-3">
            {stats.open_alerts}
          </p>
        </div>



        <div className="bg-gray-900 p-6 rounded-xl">
          <h2 className="text-gray-400">
            Resolved
          </h2>

          <p className="text-3xl font-bold mt-3">
            {stats.resolved_alerts}
          </p>
        </div>



        <div className="bg-gray-900 p-6 rounded-xl">
          <h2 className="text-gray-400">
            High Risk Alerts
          </h2>

          <p className="text-3xl font-bold mt-3">
            {stats.high_risk_alerts}
          </p>
        </div>


      </div>



      <div className="mt-10 bg-gray-900 p-6 rounded-xl">

        <h2 className="text-xl font-semibold">
          Recent Threat
        </h2>


        <div className="mt-4">

          <p>
            Threat: {stats.top_threat}
          </p>

          <p className="text-gray-400">
            Live data from Chrona SOC backend
          </p>

        </div>

      </div>


    </main>
  );
}