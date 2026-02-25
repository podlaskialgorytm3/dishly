"use client";

import Image from "next/image";

interface Story {
  id: string;
  name: string;
  imageUrl: string;
  hasPromo?: boolean;
}

interface StoriesSectionProps {
  stories: Story[];
}

export function StoriesSection({ stories }: StoriesSectionProps) {
  return (
    <section className="border-b border-gray-100 bg-white py-4">
      <div className="mx-auto max-w-7xl px-4">
        {/* Horizontal Scroll Container */}
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          {stories.map((story) => (
            <button
              key={story.id}
              className="flex flex-col items-center gap-2 flex-shrink-0"
            >
              <div
                className={`relative flex h-20 w-20 items-center justify-center rounded-full ${
                  story.hasPromo
                    ? "bg-gradient-to-br from-[var(--dishly-primary)] to-[var(--dishly-accent)] p-1"
                    : "bg-gray-200 p-1"
                }`}
              >
                <div className="relative h-full w-full overflow-hidden rounded-full bg-white">
                  {story.imageUrl ? (
                    <Image
                      src={story.imageUrl}
                      alt={story.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 text-2xl">
                      🍽️
                    </div>
                  )}
                </div>
              </div>
              <span className="max-w-[80px] truncate text-xs font-medium text-[var(--dishly-text)]">
                {story.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  );
}
