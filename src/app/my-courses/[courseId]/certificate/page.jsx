"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { courseService } from "@/libs/courseService";

const CertificatePage = ({ params }) => {
  const courseId = use(params).courseId;
  const { user, loading } = useAuth();
  const router = useRouter();
  const [course, setCourse] = useState(null);
  const [progress, setProgress] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/?signin=true");
    }
  }, [user, loading, router]);

  useEffect(() => {
    const load = async () => {
      if (!user || !courseId) return;

      try {
        const hasAccess = await courseService.verifyUserCourseAccess(
          user.id,
          courseId
        );
        if (!hasAccess) {
          router.push("/my-courses");
          return;
        }

        const [details, courseProgress] = await Promise.all([
          courseService.getCourseWithPricing(courseId),
          courseService.getCourseProgress(user.id, courseId),
        ]);

        setCourse(details);
        setProgress(courseProgress);
      } catch (error) {
        console.error("Error loading certificate:", error);
        router.push("/my-courses");
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [user, courseId, router]);

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-[#181818] flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!user || !course) return null;

  const isComplete = progress && progress.percentage === 100;
  const studentName = user.user_metadata?.full_name || user.email;
  const completionDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  if (!isComplete) {
    return (
      <main className="min-h-screen bg-[#181818] flex items-center justify-center p-8">
        <div className="max-w-md text-center">
          <div className="text-5xl mb-4">🎓</div>
          <h1 className="text-2xl font-bold text-white mb-3">
            Almost there!
          </h1>
          <p className="text-gray-400 mb-6">
            Your certificate unlocks when you complete all lessons. You&apos;re
            at {progress?.percentage || 0}% — keep going!
          </p>
          <Link
            href={`/my-courses/${courseId}`}
            className="inline-block bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-6 py-3 rounded-lg transition-colors"
          >
            Back to Course
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#181818] py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8 print:hidden">
          <Link
            href={`/my-courses/${courseId}`}
            className="text-white hover:text-gray-300"
          >
            ← Back to Course
          </Link>
          <button
            onClick={() => window.print()}
            className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-6 py-3 rounded-lg transition-colors"
          >
            Print / Save as PDF
          </button>
        </div>

        <div
          id="certificate"
          className="bg-[#fdfcf7] text-neutral-900 rounded-lg p-10 md:p-16 border-[10px] border-emerald-600 text-center shadow-2xl"
        >
          <div className="text-5xl mb-4">🐸</div>
          <div className="text-sm font-bold uppercase tracking-[0.3em] text-emerald-700 mb-8">
            FroggoCodes
          </div>

          <h1 className="text-3xl md:text-4xl font-black mb-2">
            Certificate of Completion
          </h1>
          <p className="text-neutral-500 mb-10">This certifies that</p>

          <p className="text-3xl md:text-4xl font-bold text-emerald-700 mb-10 border-b-2 border-neutral-300 inline-block px-8 pb-2">
            {studentName}
          </p>

          <p className="text-neutral-600 mb-2">
            has successfully completed all {progress.totalCount} lessons of
          </p>
          <p className="text-2xl font-bold mb-12">{course.title}</p>

          <div className="flex justify-between items-end text-sm text-neutral-500 mt-16">
            <div className="text-left">
              <div className="border-t border-neutral-400 pt-2 px-4">
                {completionDate}
              </div>
              <div className="px-4 text-xs mt-1">Date</div>
            </div>
            <div className="text-right">
              <div className="border-t border-neutral-400 pt-2 px-4 font-bold">
                froggo.codes
              </div>
              <div className="px-4 text-xs mt-1">FroggoCodes</div>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #certificate,
          #certificate * {
            visibility: visible;
          }
          #certificate {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            border-width: 6px;
          }
        }
      `}</style>
    </main>
  );
};

export default CertificatePage;
