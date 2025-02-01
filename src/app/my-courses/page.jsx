"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { courseService } from "@/libs/courseService";
import Link from "next/link";

const MyCourses = () => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [myCourses, setMyCourses] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/?signin=true");
    }
  }, [user, loading, router]);

  useEffect(() => {
    const fetchCourses = async () => {
      if (user) {
        try {
          // Fetch user's enrolled courses with progress
          const userCourses = await courseService.getUserCourses(user.id);
          const coursesWithProgress = await Promise.all(
            userCourses.map(async (course) => {
              const progress = await courseService.getCourseProgress(
                user.id,
                course.course_id
              );
              const completedVideos = progress.filter((p) => p.completed).length;
              const progressPercentage =
                progress.length > 0
                  ? Math.round((completedVideos / progress.length) * 100)
                  : 0;

              return {
                id: course.course_id,
                title: course.courses.title,
                description: course.courses.description,
                thumbnail: course.courses.thumbnail || "🐍",
                progress: progressPercentage,
                lastAccessed: course.last_accessed,
              };
            })
          );
          setMyCourses(coursesWithProgress);

          // Fetch all courses and mark enrolled ones
          const allAvailableCourses = await courseService.getAllCourses();
          const enrolledCourseIds = new Set(coursesWithProgress.map(c => c.id));
          
          setAllCourses(allAvailableCourses.map(course => ({
            ...course,
            isEnrolled: enrolledCourseIds.has(course.id),
            thumbnail: course.thumbnail || "🐍"
          })));
        } catch (error) {
          console.error("Error fetching courses:", error);
        }
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, [user]);

  const handleEnroll = async (courseId) => {
    try {
      await courseService.updateLastAccessed(user.id, courseId);
      // Refresh the courses data
      window.location.reload();
    } catch (error) {
      console.error("Error enrolling in course:", error);
    }
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-[#181818] flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <main className="min-h-screen bg-[#181818] py-24 px-8">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/"
          className="text-white hover:text-gray-300 mb-8 inline-flex items-center"
        >
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

        {/* My Courses Section */}
        <section className="mb-16">
          <h1 className="text-4xl font-bold text-white mb-8">My Courses</h1>
          {myCourses.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2">
              {myCourses.map((course) => (
                <div
                  key={course.id}
                  className="bg-neutral-800 rounded-lg p-6 border border-white/10 hover:border-emerald-500/50 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-4xl mb-4 block">
                        {course.thumbnail}
                      </span>
                      <h3 className="text-xl font-bold text-white mb-2">
                        {course.title}
                      </h3>
                      <p className="text-emerald-500 mb-4">
                        Progress: {course.progress}%
                      </p>
                      <p className="text-sm text-gray-400">
                        Last accessed:{" "}
                        {new Date(course.lastAccessed).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <Link
                      href={`/my-courses/${course.id}`}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-4 rounded-md transition-colors inline-block text-center"
                    >
                      Continue Learning
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-400">
                You haven't enrolled in any courses yet.
              </p>
            </div>
          )}
        </section>

        {/* All Courses Section */}
        <section>
          <h2 className="text-4xl font-bold text-white mb-8">All Courses</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {allCourses.map((course) => (
              <div
                key={course.id}
                className="bg-neutral-800 rounded-lg p-6 border border-white/10 hover:border-emerald-500/50 transition-all relative"
              >
                {course.isEnrolled && (
                  <div className="absolute top-4 right-4">
                    <span className="bg-emerald-600 text-white text-xs px-2 py-1 rounded-full">
                      Enrolled
                    </span>
                  </div>
                )}
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-4xl mb-4 block">
                      {course.thumbnail}
                    </span>
                    <h3 className="text-xl font-bold text-white mb-2">
                      {course.title}
                    </h3>
                    <p className="text-gray-400 mb-4">{course.description}</p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-white/10">
                  {course.isEnrolled ? (
                    <Link
                      href={`/my-courses/${course.id}`}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-4 rounded-md transition-colors inline-block text-center"
                    >
                      Continue Learning
                    </Link>
                  ) : (
                    <button
                      onClick={() => handleEnroll(course.id)}
                      className="w-full bg-white hover:bg-emerald-100 text-emerald-700 py-2 px-4 rounded-md transition-colors"
                    >
                      Enroll Now
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
};

export default MyCourses;
