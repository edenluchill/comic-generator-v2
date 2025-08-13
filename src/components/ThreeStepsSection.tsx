"use client";

import Image from "next/image";

export default function ThreeStepsSection() {
  // Supabase storage URLs for the general bucket
  const supabaseStorageUrl =
    "https://jtdhkrlmaaknbmisoxde.supabase.co/storage/v1/object/public/general";

  return (
    <div className="max-w-7xl mx-auto py-4 px-4">
      {/* 标题 - 调整大小 */}
      <div className="text-center mb-6">
        <p className="text-base md:text-lg text-rose-700 font-medium">
          简单三步，创作你的专属回忆
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-4">
        {/* 第一步：上传照片 */}
        <div className="relative border-2 border-dashed border-pink-300 rounded-2xl p-4 md:p-6 bg-gradient-to-br from-pink-50/50 to-rose-50/50 hover:border-pink-400 transition-all duration-300 overflow-hidden">
          <div className="text-center">
            <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2">
              <span className="inline-flex items-center justify-center w-8 h-8 bg-gradient-to-r from-rose-500 to-pink-500 rounded-lg text-white text-lg font-bold mr-2 shadow-lg">
                1
              </span>
              上传照片
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              上传你想要转换的人物照片
            </p>

            <div className="flex flex-col sm:flex-row gap-2 justify-center items-center">
              {/* 第一张照片 */}
              <div className="relative group">
                <div className="relative bg-white rounded-xl overflow-hidden shadow-lg border border-gray-100 w-28 h-36 sm:w-32 sm:h-40 hover:shadow-xl transition-all duration-300">
                  <Image
                    src={`${supabaseStorageUrl}/ponytail-girl.webp`}
                    alt="原始照片1"
                    fill
                    className="object-cover object-center"
                    sizes="(max-width: 640px) 112px, 128px"
                  />
                </div>
                {/* 添加小标签 */}
                <div className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded-full shadow-lg font-medium">
                  照片A
                </div>
              </div>

              {/* 第二张照片 */}
              <div className="relative group">
                <div className="relative bg-white rounded-xl overflow-hidden shadow-lg border border-gray-100 w-28 h-36 sm:w-32 sm:h-40 hover:shadow-xl transition-all duration-300">
                  <Image
                    src={`${supabaseStorageUrl}/grandma.jpg`}
                    alt="原始照片2"
                    fill
                    className="object-cover"
                    style={{ objectPosition: "80%" }}
                    sizes="(max-width: 640px) 112px, 128px"
                  />
                </div>
                {/* 添加小标签 */}
                <div className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded-full shadow-lg font-medium">
                  照片B
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 第二步：生成角色 */}
        <div className="relative border-2 border-dashed border-pink-300 rounded-2xl p-4 md:p-6 bg-gradient-to-br from-pink-50/50 to-rose-50/50 hover:border-pink-400 transition-all duration-300 overflow-hidden">
          <div className="text-center">
            <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2">
              <span className="inline-flex items-center justify-center w-8 h-8 bg-gradient-to-r from-rose-500 to-pink-500 rounded-lg text-white text-lg font-bold mr-2 shadow-lg">
                2
              </span>
              生成角色
            </h3>
            <p className="text-gray-600 text-sm mb-4">AI将照片转换为卡通角色</p>

            <div className="flex flex-col sm:flex-row gap-2 justify-center items-center">
              {/* 第一个角色 */}
              <div className="relative group">
                <div className="relative bg-white rounded-xl overflow-hidden shadow-lg border border-gray-100 w-28 h-36 sm:w-32 sm:h-40 hover:shadow-xl transition-all duration-300">
                  <Image
                    src={`${supabaseStorageUrl}/ponytail-girl-ghibli.avif`}
                    alt="卡通角色1"
                    fill
                    className="object-cover object-center"
                    sizes="(max-width: 640px) 112px, 128px"
                  />
                </div>
                {/* 对应标签 */}
                <div className="absolute -top-1 -right-1 bg-green-500 text-white text-xs px-1.5 py-0.5 rounded-full shadow-lg font-medium">
                  角色A
                </div>
              </div>

              {/* 第二个角色 */}
              <div className="relative group">
                <div className="relative bg-white rounded-xl overflow-hidden shadow-lg border border-gray-100 w-28 h-36 sm:w-32 sm:h-40 hover:shadow-xl transition-all duration-300">
                  <Image
                    src={`${supabaseStorageUrl}/grandma-ghibli.avif`}
                    alt="卡通角色2"
                    fill
                    className="object-cover"
                    style={{ objectPosition: "center 10%" }}
                    sizes="(max-width: 640px) 112px, 128px"
                  />
                </div>
                {/* 对应标签 */}
                <div className="absolute -top-1 -right-1 bg-green-500 text-white text-xs px-1.5 py-0.5 rounded-full shadow-lg font-medium">
                  角色B
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 第三步：生成故事 */}
        <div className="relative border-2 border-dashed border-pink-300 rounded-2xl p-4 md:p-6 bg-gradient-to-br from-pink-50/50 to-rose-50/50 hover:border-pink-400 transition-all duration-300 overflow-hidden">
          <div className="text-center">
            <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2">
              <span className="inline-flex items-center justify-center w-8 h-8 bg-gradient-to-r from-rose-500 to-pink-500 rounded-lg text-white text-lg font-bold mr-2 shadow-lg">
                3
              </span>
              生成故事
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              创作包含角色的温馨故事场景
            </p>

            <div className="flex justify-center items-center">
              <div className="relative group bg-white rounded-xl overflow-hidden shadow-lg border border-gray-100 w-80 h-48 sm:w-96 sm:h-56 hover:shadow-xl transition-all duration-300">
                <Image
                  src={`${supabaseStorageUrl}/grandma-read-story.avif`}
                  alt="故事场景"
                  fill
                  className="object-cover object-center"
                  sizes="(max-width: 640px) 320px, 384px"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
