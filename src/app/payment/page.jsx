"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { initializePayment } from "@/libs/paymentService";

const PaymentPage = () => {
  const { user } = useAuth();
  const router = useRouter();

  const handlePayment = async () => {
    try {
      await initializePayment(user);
    } catch (error) {
      console.error('Payment failed:', error);
      alert('Payment failed. Please try again.');
    }
  };

  if (!user) {
    router.push('/?signin=true');
    return null;
  }

  return (
    <main className="min-h-screen bg-[#181818] py-24 px-8">
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="btn btn-ghost text-white mb-6 inline-flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-5 h-5 mr-2"
          >
            <path
              fillRule="evenodd"
              d="M15 10a.75.75 0 01-.75.75H7.612l2.158 1.96a.75.75 0 11-1.04 1.08l-3.5-3.25a.75.75 0 010-1.08l3.5-3.25a.75.75 0 111.04 1.08L7.612 9.25h6.638A.75.75 0 0115 10z"
              clipRule="evenodd"
            />
          </svg>
          Back
        </Link>

        <div className="bg-neutral-800 rounded-lg p-8 shadow-lg border border-white/10">
          <h1 className="text-3xl font-bold text-white mb-8">Complete Your Purchase</h1>
          
          <div className="space-y-6 text-white">
            <div className="border-b border-white/10 pb-6">
              <h2 className="text-xl font-semibold mb-4">Python Bootcamp</h2>
              <p className="text-gray-300 mb-4">Get ready to master Python and build real-world applications</p>
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold">₹1,999</span>
                <span className="text-gray-400 line-through">₹3,999</span>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">What you get:</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-300">
                <li>30 days of intensive Python training</li>
                <li>Real-world project experience</li>
                <li>Industry-standard best practices</li>
                <li>Lifetime access to course materials</li>
                <li>Certificate of completion</li>
              </ul>
            </div>

            <button
              onClick={handlePayment}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 px-4 rounded-md transition-colors font-semibold"
            >
              Pay Now
            </button>
          </div>
        </div>
      </div>
    </main>
  );
};

export default PaymentPage;