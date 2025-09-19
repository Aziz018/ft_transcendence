import { MyReact } from "../../lib/core";
import { Link } from "../../lib/router";

function Dashboard() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Guest</h1>
      <p>
        Welcome to your dashboard! Here you can manage your account and view
        your activities.
      </p>
      <Link
        to="/"
        className="text-sm text-indigo-600 hover:underline mt-4 block">
        Back to Home
      </Link>
    </div>
  );
}

export default Dashboard;
