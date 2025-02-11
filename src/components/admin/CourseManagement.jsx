"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { courseService } from "@/libs/courseService";

export default function CourseManagement() {
  const { user, isAdmin } = useAuth();
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    thumbnail: "🎓",
  });
  const [videos, setVideos] = useState([]);
  const [videoForm, setVideoForm] = useState({
    title: "",
    description: "",
    duration: "",
    video_url: "",
    order_index: 1,
  });

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    const allCourses = await courseService.getAllCourses();
    setCourses(allCourses);
  };

  const handleCourseSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase
        .from("courses")
        .insert([formData])
        .select();

      if (error) throw error;
      setCourses([...courses, data[0]]);
      setFormData({ title: "", description: "", thumbnail: "🎓" });
    } catch (error) {
      console.error("Error adding course:", error);
    }
  };

  const handleVideoSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCourse) return;

    try {
      const { data, error } = await supabase
        .from("videos")
        .insert([{ ...videoForm, course_id: selectedCourse.id }])
        .select();

      if (error) throw error;
      setVideos([...videos, data[0]]);
      setVideoForm({
        title: "",
        description: "",
        duration: "",
        video_url: "",
        order_index: videos.length + 1,
      });
    } catch (error) {
      console.error("Error adding video:", error);
    }
  };

  const loadCourseVideos = async (course) => {
    setSelectedCourse(course);
    const { data, error } = await supabase
      .from("videos")
      .select("*")
      .eq("course_id", course.id)
      .order("order_index");

    if (error) throw error;
    setVideos(data);
  };

  if (!isAdmin) {
    return <div>Unauthorized</div>;
  }

  return (
    <div className="min-h-screen bg-[#181818] py-24 px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">Course Management</h1>

        {/* Course Form */}
        <div className="bg-neutral-800 p-6 rounded-lg mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Add New Course</h2>
          <form onSubmit={handleCourseSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Course Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full p-2 rounded bg-gray-700 text-white"
            />
            <textarea
              placeholder="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full p-2 rounded bg-gray-700 text-white"
            />
            <input
              type="text"
              placeholder="Thumbnail Emoji"
              value={formData.thumbnail}
              onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
              className="w-full p-2 rounded bg-gray-700 text-white"
            />
            <button
              type="submit"
              className="bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-700"
            >
              Add Course
            </button>
          </form>
        </div>

        {/* Course List */}
        <div className="grid gap-6 md:grid-cols-2">
          {courses.map((course) => (
            <div
              key={course.id}
              className="bg-neutral-800 p-6 rounded-lg cursor-pointer"
              onClick={() => loadCourseVideos(course)}
            >
              <div className="text-4xl mb-2">{course.thumbnail}</div>
              <h3 className="text-xl font-bold text-white">{course.title}</h3>
              <p className="text-gray-400">{course.description}</p>
            </div>
          ))}
        </div>

        {/* Video Management */}
        {selectedCourse && (
          <div className="mt-8 bg-neutral-800 p-6 rounded-lg">
            <h2 className="text-2xl font-bold text-white mb-4">
              Manage Videos for {selectedCourse.title}
            </h2>
            
            {/* Video Form */}
            <form onSubmit={handleVideoSubmit} className="space-y-4 mb-8">
              <input
                type="text"
                placeholder="Video Title"
                value={videoForm.title}
                onChange={(e) => setVideoForm({ ...videoForm, title: e.target.value })}
                className="w-full p-2 rounded bg-gray-700 text-white"
              />
              <textarea
                placeholder="Video Description"
                value={videoForm.description}
                onChange={(e) => setVideoForm({ ...videoForm, description: e.target.value })}
                className="w-full p-2 rounded bg-gray-700 text-white"
              />
              <input
                type="text"
                placeholder="Duration (e.g., 10:00)"
                value={videoForm.duration}
                onChange={(e) => setVideoForm({ ...videoForm, duration: e.target.value })}
                className="w-full p-2 rounded bg-gray-700 text-white"
              />
              <input
                type="url"
                placeholder="Video URL"
                value={videoForm.video_url}
                onChange={(e) => setVideoForm({ ...videoForm, video_url: e.target.value })}
                className="w-full p-2 rounded bg-gray-700 text-white"
              />
              <input
                type="number"
                placeholder="Order Index"
                value={videoForm.order_index}
                onChange={(e) => setVideoForm({ ...videoForm, order_index: parseInt(e.target.value) })}
                className="w-full p-2 rounded bg-gray-700 text-white"
              />
              <button
                type="submit"
                className="bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-700"
              >
                Add Video
              </button>
            </form>

            {/* Video List */}
            <div className="space-y-4">
              {videos.map((video) => (
                <div
                  key={video.id}
                  className="bg-neutral-700 p-4 rounded-lg flex items-center justify-between"
                >
                  <div>
                    <h4 className="text-white font-medium">{video.title}</h4>
                    <p className="text-gray-400 text-sm">{video.duration}</p>
                  </div>
                  <span className="text-gray-400">#{video.order_index}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}