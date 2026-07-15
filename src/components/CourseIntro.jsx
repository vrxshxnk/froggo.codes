"use client";

import { useEffect, useState } from "react";
import config from "@/config";

const CourseIntro = () => {
    // Public intro/scope video, configured via NEXT_PUBLIC_BUNNY_INTRO_VIDEO_ID
    // (the Bunny video GUID). The API signs it without requiring sign-in, so
    // it keeps working when embed token authentication is enabled in Bunny.
    const introVideoId = config.bunny.introVideoId;
    const [embedUrl, setEmbedUrl] = useState(null);

    useEffect(() => {
        if (!introVideoId) return;

        const loadSignedUrl = async () => {
            try {
                const response = await fetch("/api/get-video-url", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ videoId: introVideoId }),
                });

                if (response.ok) {
                    const data = await response.json();
                    setEmbedUrl(data.url);
                    return;
                }
            } catch {
                // fall through to the unsigned URL below
            }

            // Fallback: plain embed URL (works while token auth is disabled)
            setEmbedUrl(
                `${config.bunny.embedBaseUrl}/${config.bunny.libraryId}/${introVideoId}`
            );
        };

        loadSignedUrl();
    }, [introVideoId]);

    if (!introVideoId) return null;

    return (
        <section className="bg-[#181818] py-16 md:py-24 px-8 lg:px-4" id="intro">
            <div className="max-w-5xl mx-auto">
                <h2 className="text-center font-extrabold text-4xl md:text-5xl tracking-tight leading-normal mb-4">
                    <span className="leading-loose text-center text-5xl">🧑🏻‍🏫📚💡</span>
                    <br />
                    <span className="text-white">Here&apos;s What You&apos;ll Learn</span>
                </h2>

                <p className="text-center text-neutral-400 text-lg mb-10 max-w-2xl mx-auto">
                    Watch this quick overview to understand the complete scope of the course 🎯
                </p>

                {/* Video Container with 16:9 aspect ratio */}
                <div className="relative w-full rounded-xl overflow-hidden shadow-2xl" style={{ paddingTop: "56.25%" }}>
                    {embedUrl && (
                        <iframe
                            src={embedUrl}
                            className="absolute top-0 left-0 w-full h-full"
                            frameBorder="0"
                            allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
                            allowFullScreen
                            loading="lazy"
                        />
                    )}
                </div>

                <p className="text-center text-neutral-500 text-sm mt-6">
                    🐸 From zero to job-ready in 30 days
                </p>
            </div>
        </section>
    );
};

export default CourseIntro;
