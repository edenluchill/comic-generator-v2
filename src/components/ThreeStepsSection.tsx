"use client";

import Image from "next/image";
import { useTranslations } from "@/hooks/useTranslations";

export default function ThreeStepsSection() {
  const t = useTranslations("HomePage");

  // Supabase storage URLs for the general bucket
  const supabaseStorageUrl =
    "https://jtdhkrlmaaknbmisoxde.supabase.co/storage/v1/object/public/general";

  return (
    <div className="max-w-7xl mx-auto py-4 px-4">
      {/* Title - using theme colors */}
      <div className="text-center mb-6">
        <p className="text-base md:text-lg text-primary font-medium">
          {t("threeStepsSubtitle")}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-4">
        {/* Step 1: Upload Photos */}
        <div className="relative border-2 border-dashed border-primary/30 rounded-2xl p-4 md:p-6 bg-gradient-to-br from-secondary/50 to-accent/30 hover:border-primary/50 transition-all duration-300 overflow-hidden group">
          {/* Background decoration effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

          <div className="text-center relative z-10">
            <h3 className="text-lg md:text-xl font-bold text-foreground mb-2">
              <span className="inline-flex items-center justify-center w-8 h-8 bg-primary rounded-lg text-primary-foreground text-lg font-bold mr-2 shadow-lg">
                1
              </span>
              {t("threeStepsUploadTitle")}
            </h3>
            <p className="text-muted-foreground text-sm mb-4">
              {t("threeStepsUploadDesc")}
            </p>

            <div className="flex flex-col sm:flex-row gap-2 justify-center items-center">
              {/* First photo */}
              <div className="relative group/photo">
                <div className="relative bg-card rounded-xl overflow-hidden shadow-lg border border-border w-28 h-36 sm:w-32 sm:h-40 hover:shadow-xl hover:border-primary/30 transition-all duration-300">
                  <Image
                    src={`${supabaseStorageUrl}/ponytail-girl.webp`}
                    alt={t("originalPhoto1")}
                    fill
                    className="object-cover object-center group-hover/photo:scale-105 transition-transform duration-300"
                    sizes="(max-width: 640px) 112px, 128px"
                  />
                </div>
                {/* Tag using theme colors */}
                <div className="absolute -top-1 -right-1 bg-chart-2 text-white text-xs px-1.5 py-0.5 rounded-full shadow-lg font-medium">
                  {t("photoA")}
                </div>
              </div>

              {/* Second photo */}
              <div className="relative group/photo">
                <div className="relative bg-card rounded-xl overflow-hidden shadow-lg border border-border w-28 h-36 sm:w-32 sm:h-40 hover:shadow-xl hover:border-primary/30 transition-all duration-300">
                  <Image
                    src={`${supabaseStorageUrl}/grandma.jpg`}
                    alt={t("originalPhoto2")}
                    fill
                    className="object-cover group-hover/photo:scale-105 transition-transform duration-300"
                    style={{ objectPosition: "80%" }}
                    sizes="(max-width: 640px) 112px, 128px"
                  />
                </div>
                {/* Tag using theme colors */}
                <div className="absolute -top-1 -right-1 bg-chart-2 text-white text-xs px-1.5 py-0.5 rounded-full shadow-lg font-medium">
                  {t("photoB")}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Step 2: Generate Characters */}
        <div className="relative border-2 border-dashed border-primary/30 rounded-2xl p-4 md:p-6 bg-gradient-to-br from-secondary/50 to-accent/30 hover:border-primary/50 transition-all duration-300 overflow-hidden group">
          {/* Background decoration effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

          <div className="text-center relative z-10">
            <h3 className="text-lg md:text-xl font-bold text-foreground mb-2">
              <span className="inline-flex items-center justify-center w-8 h-8 bg-primary rounded-lg text-primary-foreground text-lg font-bold mr-2 shadow-lg">
                2
              </span>
              {t("threeStepsGenerateTitle")}
            </h3>
            <p className="text-muted-foreground text-sm mb-4">
              {t("threeStepsGenerateDesc")}
            </p>

            <div className="flex flex-col sm:flex-row gap-2 justify-center items-center">
              {/* First character */}
              <div className="relative group/character">
                <div className="relative bg-card rounded-xl overflow-hidden shadow-lg border border-border w-28 h-36 sm:w-32 sm:h-40 hover:shadow-xl hover:border-primary/30 transition-all duration-300">
                  <Image
                    src={`${supabaseStorageUrl}/ponytail-girl-ghibli.avif`}
                    alt={t("cartoonCharacter1")}
                    fill
                    className="object-cover object-center group-hover/character:scale-105 transition-transform duration-300"
                    sizes="(max-width: 640px) 112px, 128px"
                  />
                </div>
                {/* Corresponding tag */}
                <div className="absolute -top-1 -right-1 bg-chart-3 text-white text-xs px-1.5 py-0.5 rounded-full shadow-lg font-medium">
                  {t("characterA")}
                </div>
              </div>

              {/* Second character */}
              <div className="relative group/character">
                <div className="relative bg-card rounded-xl overflow-hidden shadow-lg border border-border w-28 h-36 sm:w-32 sm:h-40 hover:shadow-xl hover:border-primary/30 transition-all duration-300">
                  <Image
                    src={`${supabaseStorageUrl}/grandma-ghibli.avif`}
                    alt={t("cartoonCharacter2")}
                    fill
                    className="object-cover group-hover/character:scale-105 transition-transform duration-300"
                    style={{ objectPosition: "center 10%" }}
                    sizes="(max-width: 640px) 112px, 128px"
                  />
                </div>
                {/* Corresponding tag */}
                <div className="absolute -top-1 -right-1 bg-chart-3 text-white text-xs px-1.5 py-0.5 rounded-full shadow-lg font-medium">
                  {t("characterB")}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Step 3: Generate Story */}
        <div className="relative border-2 border-dashed border-primary/30 rounded-2xl p-4 md:p-6 bg-gradient-to-br from-secondary/50 to-accent/30 hover:border-primary/50 transition-all duration-300 overflow-hidden group">
          {/* Background decoration effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

          <div className="text-center relative z-10">
            <h3 className="text-lg md:text-xl font-bold text-foreground mb-2">
              <span className="inline-flex items-center justify-center w-8 h-8 bg-primary rounded-lg text-primary-foreground text-lg font-bold mr-2 shadow-lg">
                3
              </span>
              {t("threeStepsStoryTitle")}
            </h3>
            <p className="text-muted-foreground text-sm mb-4">
              {t("threeStepsStoryDesc")}
            </p>

            <div className="flex justify-center items-center">
              <div className="relative group/story bg-card rounded-xl overflow-hidden shadow-lg border border-border w-80 h-48 sm:w-96 sm:h-56 hover:shadow-xl hover:border-primary/30 transition-all duration-300">
                <Image
                  src={`${supabaseStorageUrl}/grandma-read-story.avif`}
                  alt={t("storyScene")}
                  fill
                  className="object-cover object-center group-hover/story:scale-105 transition-transform duration-300"
                  sizes="(max-width: 640px) 320px, 384px"
                />
                {/* Add story tag */}
                <div className="absolute top-3 right-3 bg-primary/90 text-primary-foreground text-xs px-2 py-1 rounded-full shadow-lg font-medium backdrop-blur-sm">
                  {t("aiStory")}
                </div>

                {/* Description shown on hover */}
                <div className="absolute inset-0 bg-primary/10 backdrop-blur-sm opacity-0 group-hover/story:opacity-100 transition-all duration-300 flex items-center justify-center">
                  <div className="bg-card/95 rounded-lg p-3 mx-4 shadow-lg border border-border">
                    <p className="text-foreground text-sm font-medium text-center">
                      {t("warmGrandparentReading")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
