// pages/index.js
export default function Home() {
  return (
    <main className="flex items-center justify-center">
      {/* Outer container with large rounded corners */}
      <div className="relative flex w-full bg-white rounded-[2rem] overflow-hidden shadow-lg">
        {/* Left side (white area) */}
        <div className="w-1/2 h-full p-12 flex flex-col justify-center">
          <h1 className="text-5xl font-bold text-[#1F1E3D] leading-tight">
            Building the future of AI together
          </h1>
          <p className="mt-6 text-lg text-gray-600">
            AI is transforming the world, and we are leading the charge. We are
            constructing the future of AI as a collective.
          </p>
          <button className="mt-8 inline-block bg-[#6C63FF] text-white px-6 py-3 rounded-full hover:bg-indigo-700 transition-colors">
            Get started
          </button>

          {/* User stats */}
          <div className="mt-8 flex space-x-8">
            <div>
              <span className="block text-2xl font-bold text-[#1F1E3D]">
                450,000
              </span>
              <span className="text-sm text-gray-500">
                Users building Cleverbot together
              </span>
            </div>
            <div>
              <span className="block text-2xl font-bold text-[#1F1E3D]">
                1M
              </span>
              <span className="text-sm text-gray-500">
                Estimated additional reach
              </span>
            </div>
          </div>

          {/* User avatars */}
          <div className="mt-6 flex items-center">
            <div className="flex -space-x-2">
              <img
                className="w-10 h-10 rounded-full border-2 border-white"
                src="/user1.jpg"
                alt="User 1"
              />
              <img
                className="w-10 h-10 rounded-full border-2 border-white"
                src="/user2.jpg"
                alt="User 2"
              />
              <img
                className="w-10 h-10 rounded-full border-2 border-white"
                src="/user3.jpg"
                alt="User 3"
              />
            </div>
            <span className="ml-4 text-gray-600">+5 more</span>
          </div>
        </div>

        {/* Right side (lavender area) */}
        <div className="w-1/2 h-full bg-[#F3EFFF] relative flex flex-col justify-center items-center">
          {/* "Get started" button at top-right */}
          <div className="absolute top-8 right-8">
            <button className="bg-white text-[#6C63FF] font-medium px-4 py-2 rounded-full shadow hover:bg-gray-50">
              Get started
            </button>
          </div>

          {/* 3D illustration placeholder */}
          <div className="w-2/3 h-2/3 bg-[#E2D9FF] rounded-2xl flex items-center justify-center">
            <span className="text-gray-500">3D Illustration</span>
          </div>

          {/* Bottom prompt bar */}
          <div className="absolute bottom-8 left-8 right-8 bg-white rounded-full p-4 shadow flex items-center justify-between">
            <span className="text-gray-400">AI is generating...</span>
            <button className="bg-[#6C63FF] text-white px-4 py-2 rounded-full">
              Prompt
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
