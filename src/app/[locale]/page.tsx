"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Heart,
  Sparkles,
  Stars,
  ArrowRight,
  Palette,
  Mail,
  Globe,
  MessageCircle,
} from "lucide-react";
import { useTranslations } from "@/hooks/useTranslations";
import { useLocalizedNavigation } from "@/hooks/useLocalizedNavigation";
import { getAvailableStyles } from "@/lib/character-styles";
import ThreeStepsSection from "@/components/ThreeStepsSection";

function StyleImage({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  const [imgSrc, setImgSrc] = useState(src);
  return (
    <Image
      src={imgSrc}
      alt={alt}
      fill
      className={className || "object-cover"}
      sizes="(min-width: 768px) 50vw, 100vw"
      onError={() => setImgSrc("/samples/avatar.png")}
    />
  );
}

export default function HomePage() {
  const t = useTranslations("HomePage");
  const tc = useTranslations("Common");
  const { getLocalizedHref } = useLocalizedNavigation();
  const sectionRef = useRef<HTMLElement>(null);
  const sceneCardsRef = useRef<HTMLElement>(null);
  const userReviewsRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [animatedImages, setAnimatedImages] = useState<boolean[]>([]);
  const [sceneCardsVisible, setSceneCardsVisible] = useState(false);
  const [userReviewsVisible, setUserReviewsVisible] = useState(false);

  const styleExamples = getAvailableStyles()
    .map((s) => ({
      key: s.key,
      name: s.name,
      src: `/samples/styles/${s.key}.png`,
    }))
    .slice(0, 6);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
          const delays = [200, 400, 600, 800, 1000, 1200];
          delays.forEach((delay, index) => {
            setTimeout(() => {
              setAnimatedImages((prev) => {
                const newState = [...prev];
                newState[index] = true;
                return newState;
              });
            }, delay);
          });
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, [isVisible]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !sceneCardsVisible) {
          setSceneCardsVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    if (sceneCardsRef.current) {
      observer.observe(sceneCardsRef.current);
    }

    return () => observer.disconnect();
  }, [sceneCardsVisible]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !userReviewsVisible) {
          setUserReviewsVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    if (userReviewsRef.current) {
      observer.observe(userReviewsRef.current);
    }

    return () => observer.disconnect();
  }, [userReviewsVisible]);

  return (
    <div className="min-h-screen bg-theme-gradient">
      <div className="container flex flex-col mx-auto px-4 gap-16 md:gap-24">
        {/* Section 1: Hero Area */}
        <section className="min-h-screen flex flex-col justify-center relative overflow-hidden pt-16 pb-20">
          {/* Background decorations */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-20 left-10 w-32 h-32 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute top-40 right-20 w-24 h-24 bg-accent/30 rounded-full blur-2xl animate-pulse delay-1000"></div>
            <div className="absolute bottom-32 left-1/4 w-40 h-40 bg-secondary/40 rounded-full blur-3xl animate-pulse delay-2000"></div>
            <div className="absolute bottom-20 right-1/3 w-28 h-28 bg-primary/25 rounded-full blur-2xl animate-pulse delay-500"></div>
          </div>

          {/* Main content area */}
          <div className="flex-1 flex flex-col justify-center max-w-7xl mx-auto px-4 text-center relative z-10">
            {/* Main title */}
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-tight mb-3">
              <span className="bg-primary bg-clip-text text-primary">
                {t("title")}
              </span>
            </h1>

            {/* Description */}
            <p className="text-base md:text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-6">
              {t("description1")} {t("description2")}
            </p>

            {/* Button group */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
              <Link href={getLocalizedHref("/workshop")}>
                <Button
                  size="lg"
                  className="btn-theme-primary rounded-full px-8 py-4 text-base font-semibold shadow-2xl"
                >
                  {t("startCreating")}
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>

            {/* Three steps creation flow */}
            <div className="flex-1">
              <ThreeStepsSection />
            </div>
          </div>

          {/* Floating mouse hint */}
          <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 animate-bounce">
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <span className="text-sm">{tc("scrollDownForMore")}</span>
              <div className="w-6 h-10 border-2 border-border rounded-full flex justify-center">
                <div className="w-1 h-3 bg-primary rounded-full mt-2 animate-pulse"></div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Upload Photo Generate Multi-Style Characters */}
        <section ref={sectionRef} className="max-w-6xl mx-auto ">
          <div className="grid md:grid-cols-3 gap-10 items-center relative">
            {/* Left: User uploaded image */}
            <div
              className={`order-1 transition-all duration-1000 ${
                isVisible
                  ? "translate-x-0 opacity-100"
                  : "-translate-x-8 opacity-0"
              }`}
            >
              <div className="relative rounded-3xl border border-border bg-card/70 p-3 shadow-md">
                <div className="relative aspect-[4/5] w-full rounded-2xl overflow-hidden bg-secondary">
                  <Image
                    src="/samples/upload.jpg"
                    alt={tc("userUploadedImage")}
                    fill
                    className="object-cover"
                    sizes="(min-width: 768px) 33vw, 100vw"
                    priority
                  />
                  <span className="absolute bottom-3 left-3 text-primary text-sm bg-card/70 rounded-full px-3 py-1 border border-border">
                    {tc("userUploadedImage")}
                  </span>
                  <Stars className="absolute top-4 right-4 w-5 h-5 text-muted-foreground" />
                </div>
              </div>
            </div>

            {/* Center: Step description */}
            <div
              className={`order-2 space-y-6 transition-all duration-1000 delay-300 ${
                isVisible
                  ? "translate-y-0 opacity-100"
                  : "translate-y-8 opacity-0"
              }`}
              style={{ position: "relative" }}
            >
              <h2 className="text-2xl md:text-3xl font-semibold text-foreground">
                {t("stepUploadPhotoGenerateStyles")}
              </h2>
              <p
                className="mt-3 text-muted-foreground leading-relaxed"
                style={{
                  textAlign: "justify",
                  shapeOutside:
                    "polygon(0% 0%, 100% 0%, 85% 30%, 70% 50%, 85% 70%, 100% 100%, 0% 100%)",
                  clipPath: "none",
                }}
              >
                {t("uploadPhotoDescription")}
              </p>
              <ul className="mt-2 space-y-2 text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-primary" />{" "}
                  {tc("supportPortraitPhotos")}
                </li>
                <li className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-accent" />{" "}
                  {tc("autoAnalyzeFacialFeatures")}
                </li>
              </ul>
            </div>

            {/* Right: Style avatars fan display */}
            <div className="order-3">
              <div className="relative aspect-square w-full bg-transparent p-0 overflow-visible shadow-none">
                <div className="absolute -inset-4 md:-inset-6">
                  {styleExamples.map((ex, i) => {
                    const positions = [
                      { top: "-8%", left: "18%", rotate: -20, z: 10 },
                      { top: "-8%", left: "58%", rotate: 20, z: 20 },
                      { top: "12%", left: "6%", rotate: -10, z: 30 },
                      { top: "12%", left: "70%", rotate: 10, z: 40 },
                      { top: "50%", left: "26%", rotate: 5, z: 50 },
                      { top: "58%", left: "46%", rotate: -8, z: 60 },
                    ];
                    const p = positions[i] || positions[positions.length - 1];
                    return (
                      <div
                        key={ex.key}
                        className={`absolute w-[42%] md:w-[44%] aspect-square rounded-xl overflow-hidden shadow-xl bg-transparent transition-all duration-700 ease-out group ${
                          animatedImages[i]
                            ? "scale-100 opacity-100"
                            : "scale-0 opacity-0"
                        }`}
                        style={{
                          top: p.top,
                          left: p.left,
                          transform: `rotate(${p.rotate}deg) ${
                            animatedImages[i] ? "scale(1)" : "scale(0)"
                          }`,
                          zIndex: p.z,
                          transformOrigin: "center",
                        }}
                      >
                        <StyleImage
                          src={ex.src}
                          alt={ex.name}
                          className="object-cover"
                        />
                        <span className="absolute bottom-2 left-2 text-primary-foreground text-xs bg-primary/80 rounded-full px-2.5 py-1">
                          {ex.name}
                        </span>

                        {/* Three-view display on hover */}
                        <div className="absolute inset-0 bg-card/95 backdrop-blur-sm rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                          <div className="relative w-full h-full p-2">
                            <Image
                              src="/samples/three_view.png"
                              alt={tc("threeView")}
                              fill
                              className="object-contain"
                              sizes="(min-width: 768px) 44vw, 42vw"
                            />
                            <div className="absolute top-2 right-2 bg-primary text-primary-foreground text-xs rounded-full px-2 py-1 font-medium">
                              {tc("threeView")}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Kite line connecting animation */}
            <div
              className={`absolute inset-0 w-full h-full pointer-events-none transition-opacity duration-1000 delay-500 ${
                isVisible ? "opacity-100" : "opacity-0"
              }`}
              style={{ zIndex: 2 }}
            >
              <svg
                width="100%"
                height="100%"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
              >
                <defs>
                  <style>
                    {`
                      .kite-line {
                        fill: none;
                        stroke: oklch(0.65 0.15 340 / 0.4);
                        stroke-width: 0.6;
                        stroke-dasharray: 3,2;
                        stroke-linecap: round;
                        animation: dash 8s linear infinite;
                      }
                      .dark .kite-line {
                        stroke: oklch(0.75 0.12 340 / 0.6);
                      }
                      @keyframes dash {
                        to {
                          stroke-dashoffset: -10;
                        }
                      }
                    `}
                  </style>
                </defs>
                <path
                  d="M 32 89 C 40 78, 50 88, 60 80 C 70 72, 82 85, 85 78"
                  className="kite-line"
                />
              </svg>
            </div>
          </div>
        </section>

        {/* Section 3: AI Scene Composition */}
        <section ref={sceneCardsRef} className="max-w-7xl mx-auto ">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 backdrop-blur px-6 py-2 border border-primary/20 text-primary mb-6">
              <Stars className="w-5 h-5" />
              <span className="font-medium">
                AI Scene Composition • Rich Visuals • Simple Input
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold bg-primary bg-clip-text text-transparent mb-4">
              {t("aiSceneComposition")}
            </h2>
            <p className="text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
              {t("aiSceneDescription")}
            </p>
          </div>

          {/* Input example */}
          <div className="text-center mb-8">
            <div className="inline-block bg-card rounded-xl p-6 shadow-lg border border-border">
              <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg p-4 border-l-4 border-primary">
                <p className="text-primary text-xl font-medium italic">
                  {t("simpleInputExample")}
                </p>
              </div>
              <p className="text-muted-foreground text-sm mt-3">
                {t("simpleInputDescription")}
              </p>
            </div>
          </div>

          {/* Four generated result images */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {/* Scene 1: Quiet Countryside Time */}
            <div
              className={`bg-card rounded-2xl p-6 shadow-xl border border-border group hover:scale-105 transition-all duration-700 ${
                sceneCardsVisible
                  ? "translate-y-0 opacity-100 scale-100"
                  : "translate-y-8 opacity-0 scale-95"
              }`}
              style={{ transitionDelay: "0ms" }}
            >
              <div className="relative aspect-[3/4] w-full rounded-xl overflow-hidden mb-4">
                <Image
                  src="/samples/countryside-girl.jpg"
                  alt={t("quietCountrysideTime")}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                  sizes="(min-width: 1024px) 25vw, (min-width: 768px) 50vw, 100vw"
                />
                <div
                  className={`absolute top-3 right-3 bg-accent/40 to-amber-500 text-white rounded-full px-3 py-1 text-xs font-semibold shadow-lg transition-all duration-500 ${
                    sceneCardsVisible
                      ? "translate-y-0 opacity-100"
                      : "translate-y-2 opacity-0"
                  }`}
                  style={{ transitionDelay: "200ms" }}
                >
                  {tc("countryLife")}
                </div>
              </div>
              <h4
                className={`text-lg font-bold text-accent mb-2 transition-all duration-500 ${
                  sceneCardsVisible
                    ? "translate-y-0 opacity-100"
                    : "translate-y-2 opacity-0"
                }`}
                style={{ transitionDelay: "300ms" }}
              >
                {t("quietCountrysideTime")}
              </h4>
              <p
                className={`text-muted-foreground text-sm transition-all duration-500 ${
                  sceneCardsVisible
                    ? "translate-y-0 opacity-100"
                    : "translate-y-2 opacity-0"
                }`}
                style={{ transitionDelay: "400ms" }}
              >
                {t("quietCountrysideDesc")}
              </p>
            </div>

            {/* Scene 2: Urban Love Night */}
            <div
              className={`bg-card rounded-2xl p-6 shadow-xl border border-border group hover:scale-105 transition-all duration-700 ${
                sceneCardsVisible
                  ? "translate-y-0 opacity-100 scale-100"
                  : "translate-y-8 opacity-0 scale-95"
              }`}
              style={{ transitionDelay: "150ms" }}
            >
              <div className="relative aspect-[3/4] w-full rounded-xl overflow-hidden mb-4">
                <Image
                  src="/samples/city-night-girl.jpg"
                  alt={t("urbanLoveNight")}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                  sizes="(min-width: 1024px) 25vw, (min-width: 768px) 50vw, 100vw"
                />
                <div
                  className={`absolute top-3 right-3 bg-accent/40 to-purple-500 text-white rounded-full px-3 py-1 text-xs font-semibold shadow-lg transition-all duration-500 ${
                    sceneCardsVisible
                      ? "translate-y-0 opacity-100"
                      : "translate-y-2 opacity-0"
                  }`}
                  style={{ transitionDelay: "350ms" }}
                >
                  {tc("cityNight")}
                </div>
              </div>
              <h4
                className={`text-lg font-bold text-accent mb-2 transition-all duration-500 ${
                  sceneCardsVisible
                    ? "translate-y-0 opacity-100"
                    : "translate-y-2 opacity-0"
                }`}
                style={{ transitionDelay: "450ms" }}
              >
                {t("urbanLoveNight")}
              </h4>
              <p
                className={`text-muted-foreground text-sm transition-all duration-500 ${
                  sceneCardsVisible
                    ? "translate-y-0 opacity-100"
                    : "translate-y-2 opacity-0"
                }`}
                style={{ transitionDelay: "550ms" }}
              >
                {t("urbanLoveDesc")}
              </p>
            </div>

            {/* Scene 3: Meeting Under Blue Sky */}
            <div
              className={`bg-card rounded-2xl p-6 shadow-xl border border-border group hover:scale-105 transition-all duration-700 ${
                sceneCardsVisible
                  ? "translate-y-0 opacity-100 scale-100"
                  : "translate-y-8 opacity-0 scale-95"
              }`}
              style={{ transitionDelay: "300ms" }}
            >
              <div className="relative aspect-[3/4] w-full rounded-xl overflow-hidden mb-4">
                <Image
                  src="/samples/couple2.png"
                  alt={t("meetingUnderBlueSky")}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                  sizes="(min-width: 1024px) 25vw, (min-width: 768px) 50vw, 100vw"
                />
                <div
                  className={`absolute top-3 right-3 bg-accent/40 to-blue-500 text-white rounded-full px-3 py-1 text-xs font-semibold shadow-lg transition-all duration-500 ${
                    sceneCardsVisible
                      ? "translate-y-0 opacity-100"
                      : "translate-y-2 opacity-0"
                  }`}
                  style={{ transitionDelay: "500ms" }}
                >
                  {tc("romanticTime")}
                </div>
              </div>
              <h4
                className={`text-lg font-bold text-accent mb-2 transition-all duration-500 ${
                  sceneCardsVisible
                    ? "translate-y-0 opacity-100"
                    : "translate-y-2 opacity-0"
                }`}
                style={{ transitionDelay: "600ms" }}
              >
                {t("meetingUnderBlueSky")}
              </h4>
              <p
                className={`text-muted-foreground text-sm transition-all duration-500 ${
                  sceneCardsVisible
                    ? "translate-y-0 opacity-100"
                    : "translate-y-2 opacity-0"
                }`}
                style={{ transitionDelay: "700ms" }}
              >
                {t("meetingUnderBlueSkyDesc")}
              </p>
            </div>

            {/* Scene 4: Green Wedding Moment */}
            <div
              className={`bg-card rounded-2xl p-6 shadow-xl border border-border group hover:scale-105 transition-all duration-700 ${
                sceneCardsVisible
                  ? "translate-y-0 opacity-100 scale-100"
                  : "translate-y-8 opacity-0 scale-95"
              }`}
              style={{ transitionDelay: "450ms" }}
            >
              <div className="relative aspect-[3/4] w-full rounded-xl overflow-hidden mb-4">
                <Image
                  src="/samples/wedding-couple.jpg"
                  alt={t("greenWeddingMoment")}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                  sizes="(min-width: 1024px) 25vw, (min-width: 768px) 50vw, 100vw"
                />
                <div
                  className={`absolute top-3 right-3 bg-accent/40 to-green-500 text-white rounded-full px-3 py-1 text-xs font-semibold shadow-lg transition-all duration-500 ${
                    sceneCardsVisible
                      ? "translate-y-0 opacity-100"
                      : "translate-y-2 opacity-0"
                  }`}
                  style={{ transitionDelay: "650ms" }}
                >
                  {tc("outdoorWedding")}
                </div>
              </div>
              <h4
                className={`text-lg font-bold text-accent mb-2 transition-all duration-500 ${
                  sceneCardsVisible
                    ? "translate-y-0 opacity-100"
                    : "translate-y-2 opacity-0"
                }`}
                style={{ transitionDelay: "750ms" }}
              >
                {t("greenWeddingMoment")}
              </h4>
              <p
                className={`text-muted-foreground text-sm transition-all duration-500 ${
                  sceneCardsVisible
                    ? "translate-y-0 opacity-100"
                    : "translate-y-2 opacity-0"
                }`}
                style={{ transitionDelay: "850ms" }}
              >
                {t("greenWeddingDesc")}
              </p>
            </div>
          </div>
        </section>

        {/* Section 4: Multi-Character Story Generation */}
        <section className="max-w-7xl mx-auto ">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 backdrop-blur px-6 py-2 border border-primary/20 text-primary mb-6">
              <Heart className="w-5 h-5" />
              <span className="font-medium">
                Multi-Character Story Generation
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold bg-primary bg-clip-text text-transparent mb-4">
              {t("multiCharacterStoryGeneration")}
            </h2>
            <p className="text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
              {t("multiCharacterDescription")}
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-16 items-center mb-12">
            {/* Left: Main display image */}
            <div className="relative">
              <div className="bg-card rounded-3xl p-6 shadow-2xl border border-primary group hover:scale-105 transition-transform duration-500">
                <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden bg-gradient-to-br from-primary/10 to-accent/10">
                  <Image
                    src="/samples/multi_character.png"
                    alt={t("multiCharacterStoryGeneration")}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                    sizes="(min-width: 1024px) 50vw, 100vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>

                  {/* Character tags */}
                  <div className="absolute top-4 left-4 flex gap-2">
                    <span className="bg-primary text-white rounded-full px-3 py-1 text-sm font-semibold shadow-lg">
                      花花
                    </span>
                    <span className="bg-primary text-white rounded-full px-3 py-1 text-sm font-semibold shadow-lg">
                      多多
                    </span>
                  </div>

                  {/* Story type tag */}
                  <div className="absolute bottom-4 right-4">
                    <span className="bg-card/90 backdrop-blur text-primary rounded-full px-4 py-2 text-sm font-medium shadow-lg">
                      浪漫爱情故事
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Feature introduction */}
            <div className="space-y-8">
              <div className="space-y-6">
                <h3 className="text-3xl font-bold text-foreground">
                  {t("multiCharacterInteraction")}
                </h3>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  {t("multiCharacterDetailDesc")}
                </p>
              </div>

              {/* Feature highlights */}
              <div className="grid gap-4">
                <div className="flex items-start gap-4 p-4 bg-primary/10 rounded-xl border border-primary/20">
                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                    <Heart className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">
                      {t("characterRelationshipAnalysis")}
                    </h4>
                    <p className="text-muted-foreground text-sm">
                      {t("characterRelationshipDesc")}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-accent/10 rounded-xl border border-accent/20">
                  <div className="w-10 h-10 bg-gradient-to-r from-accent to-purple rounded-full flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-accent mb-1">
                      {t("diverseStoryTypes")}
                    </h4>
                    <p className="text-muted-foreground text-sm">
                      {t("diverseStoryDesc")}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-primary/10 rounded-xl border border-primary/20">
                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                    <Stars className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">
                      {t("personalizedPlotDevelopment")}
                    </h4>
                    <p className="text-muted-foreground text-sm">
                      {t("personalizedPlotDesc")}
                    </p>
                  </div>
                </div>
              </div>

              {/* Usage flow */}
              <div className="bg-card rounded-xl p-6 shadow-lg border border-border">
                <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <span className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-sm font-bold">
                    1
                  </span>
                  {t("threeStepsTitle")}
                </h4>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 bg-primary rounded-full"></span>
                    <span>{t("step1")}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 bg-accent rounded-full"></span>
                    <span>{t("step2")}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 bg-primary rounded-full"></span>
                    <span>{t("step3")}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 5: User Reviews & Sharing */}
        <section ref={userReviewsRef} className="max-w-7xl mx-auto ">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 backdrop-blur px-6 py-2 border border-primary/20 text-primary mb-6">
              <Heart className="w-5 h-5" />
              <span className="font-medium">
                User Reviews & Community Creations
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold bg-primary bg-clip-text text-transparent mb-4">
              {t("userReviewsAndSharing")}
            </h2>
            <p className="text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
              {t("userReviewsDescription")}
            </p>
          </div>

          {/* User reviews */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {/* Review 1 */}
            <div
              className={`bg-card rounded-2xl p-6 shadow-xl border border-primary group hover:scale-105 transition-all duration-700 ${
                userReviewsVisible
                  ? "translate-y-0 opacity-100 scale-100"
                  : "translate-y-8 opacity-0 scale-95"
              }`}
              style={{ transitionDelay: "0ms" }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold text-lg">
                  小
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">小雅</h4>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Stars
                        key={i}
                        className="w-4 h-4 text-yellow-400 fill-current"
                      />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                &quot;太神奇了！上传照片后AI生成了多种风格的角色，每个都很有特色。故事生成功能更是让我惊喜，角色之间的互动非常自然。&quot;
              </p>
              <div className="text-xs text-muted-foreground">2024年1月15日</div>
            </div>

            {/* Review 2 */}
            <div
              className={`bg-card rounded-2xl p-6 shadow-xl border border-accent/20 group hover:scale-105 transition-all duration-700 ${
                userReviewsVisible
                  ? "translate-y-0 opacity-100 scale-100"
                  : "translate-y-8 opacity-0 scale-95"
              }`}
              style={{ transitionDelay: "200ms" }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-accent to-purple rounded-full flex items-center justify-center text-white font-bold text-lg">
                  阿
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">阿明</h4>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Stars
                        key={i}
                        className="w-4 h-4 text-yellow-400 fill-current"
                      />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                &quot;作为一个创作者，这个工具帮我节省了大量时间。角色设定很丰富，故事情节也很吸引人。强烈推荐给所有喜欢创作的朋友！&quot;
              </p>
              <div className="text-xs text-muted-foreground">2024年1月12日</div>
            </div>

            {/* Review 3 */}
            <div
              className={`bg-card rounded-2xl p-6 shadow-xl border border-primary group hover:scale-105 transition-all duration-700 ${
                userReviewsVisible
                  ? "translate-y-0 opacity-100 scale-100"
                  : "translate-y-8 opacity-0 scale-95"
              }`}
              style={{ transitionDelay: "400ms" }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold text-lg">
                  梦
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">梦梦</h4>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Stars
                        key={i}
                        className="w-4 h-4 text-yellow-400 fill-current"
                      />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                &quot;界面设计很漂亮，操作简单易懂。生成的故事质量很高，角色性格鲜明。已经用它创作了好几篇故事了，每次都有新的惊喜。&quot;
              </p>
              <div className="text-xs text-muted-foreground">2024年1月10日</div>
            </div>
          </div>

          {/* Creative sharing display */}
          <div className="mb-12">
            <div className="text-center mb-8">
              <h3 className="text-3xl font-bold text-foreground mb-4">
                {t("communityCreations")}
              </h3>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                {t("communityCreationsDesc")}
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Creation 1 - Garden Tea Time */}
              <div
                className={`bg-card rounded-xl p-4 shadow-lg border border-border group hover:scale-105 transition-all duration-700 ${
                  userReviewsVisible
                    ? "translate-y-0 opacity-100 scale-100"
                    : "translate-y-8 opacity-0 scale-95"
                }`}
                style={{ transitionDelay: "0ms" }}
              >
                <div className="relative aspect-[3/4] w-full rounded-lg overflow-hidden mb-3">
                  <Image
                    src="/samples/1.png"
                    alt={t("gardenTeaTime")}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                    sizes="(min-width: 1024px) 25vw, (min-width: 768px) 50vw, 100vw"
                  />
                  <div className="absolute top-2 right-2 bg-primary text-white text-xs rounded-full px-2 py-1">
                    {tc("hot")}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">
                    {t("gardenTeaTime")}
                  </span>
                  <div className="flex items-center gap-1 text-yellow-400">
                    <Stars className="w-3 h-3 fill-current" />
                    <span className="text-xs text-muted-foreground">4.9</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {tc("by")} 小雅
                </p>
              </div>

              {/* Creation 2 - Wedding Couple */}
              <div
                className={`bg-card rounded-xl p-4 shadow-lg border border-border group hover:scale-105 transition-all duration-700 ${
                  userReviewsVisible
                    ? "translate-y-0 opacity-100 scale-100"
                    : "translate-y-8 opacity-0 scale-95"
                }`}
                style={{ transitionDelay: "150ms" }}
              >
                <div className="relative aspect-[3/4] w-full rounded-lg overflow-hidden mb-3">
                  <Image
                    src="/samples/2.png"
                    alt={t("romanticWeddingMoment")}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                    sizes="(min-width: 1024px) 25vw, (min-width: 768px) 50vw, 100vw"
                  />
                  <div className="absolute top-2 right-2 bg-accent text-white text-xs rounded-full px-2 py-1">
                    {tc("new")}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">
                    {t("romanticWeddingMoment")}
                  </span>
                  <div className="flex items-center gap-1 text-yellow-400">
                    <Stars className="w-3 h-3 fill-current" />
                    <span className="text-xs text-muted-foreground">4.8</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {tc("by")} 阿明
                </p>
              </div>

              {/* Creation 3 - Running Girl */}
              <div
                className={`bg-card rounded-xl p-4 shadow-lg border border-border group hover:scale-105 transition-all duration-700 ${
                  userReviewsVisible
                    ? "translate-y-0 opacity-100 scale-100"
                    : "translate-y-8 opacity-0 scale-95"
                }`}
                style={{ transitionDelay: "300ms" }}
              >
                <div className="relative aspect-[3/4] w-full rounded-lg overflow-hidden mb-3">
                  <Image
                    src="/samples/3.png"
                    alt={t("runningInSunshine")}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                    sizes="(min-width: 1024px) 25vw, (min-width: 768px) 50vw, 100vw"
                  />
                  <div className="absolute top-2 right-2 bg-primary text-white text-xs rounded-full px-2 py-1">
                    {tc("featured")}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">
                    {t("runningInSunshine")}
                  </span>
                  <div className="flex items-center gap-1 text-yellow-400">
                    <Stars className="w-3 h-3 fill-current" />
                    <span className="text-xs text-muted-foreground">4.9</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {tc("by")} 梦梦
                </p>
              </div>

              {/* Creation 4 - School Couple */}
              <div
                className={`bg-card rounded-xl p-4 shadow-lg border border-border group hover:scale-105 transition-all duration-700 ${
                  userReviewsVisible
                    ? "translate-y-0 opacity-100 scale-100"
                    : "translate-y-8 opacity-0 scale-95"
                }`}
                style={{ transitionDelay: "450ms" }}
              >
                <div className="relative aspect-[3/4] w-full rounded-lg overflow-hidden mb-3">
                  <Image
                    src="/samples/4.png"
                    alt={t("sweetSchoolTime")}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                    sizes="(min-width: 1024px) 25vw, (min-width: 768px) 50vw, 100vw"
                  />
                  <div className="absolute top-2 right-2 bg-accent text-white text-xs rounded-full px-2 py-1">
                    {tc("recommended")}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">
                    {t("sweetSchoolTime")}
                  </span>
                  <div className="flex items-center gap-1 text-yellow-400">
                    <Stars className="w-3 h-3 fill-current" />
                    <span className="text-xs text-muted-foreground">4.7</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {tc("by")} 小雅
                </p>
              </div>
            </div>
          </div>

          {/* Share your creation */}
          <div className="text-center">
            <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-3xl p-8 border border-primary/20">
              <h3 className="text-2xl font-bold text-foreground mb-4">
                {tc("shareYourCreation")}
              </h3>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                {tc("afterCreation")}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href={getLocalizedHref("/workshop")}>
                  <Button className="btn-theme-primary rounded-full px-8 py-3 font-semibold shadow-lg transform hover:scale-105 transition-all duration-300">
                    <Heart className="w-4 h-4 mr-2" />
                    {tc("startCreating")}
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  className="rounded-full border-primary text-primary hover:bg-primary/5 px-8 py-3 font-semibold shadow-lg transform hover:scale-105 transition-all duration-300"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  {tc("viewCommunity")}
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gradient-to-r from-muted/10 via-muted/5 to-muted/10 text-muted-foreground border-t border-border shadow-sm transition-colors duration-300">
          <div className="max-w-7xl mx-auto px-4 py-16">
            {/* Main content area */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
              {/* Company info */}
              <div className="lg:col-span-2">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                    <Palette className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold bg-primary bg-clip-text text-transparent">
                      {tc("companyName")}
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      {tc("aiComicGenerator")}
                    </p>
                  </div>
                </div>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  {tc("companyDescription")}
                </p>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Stars className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm">4.9/5.0 {tc("userRating")}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Heart className="w-4 h-4 text-primary" />
                    <span className="text-sm">10,000+ {tc("usersLove")}</span>
                  </div>
                </div>
              </div>

              {/* Product features */}
              <div>
                <h4 className="text-lg font-semibold mb-6 text-foreground">
                  {tc("productFeatures")}
                </h4>
                <ul className="space-y-3">
                  <li>
                    <Link
                      href={getLocalizedHref("/workshop")}
                      className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
                    >
                      <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
                      {t("aiCharacterGeneration")}
                    </Link>
                  </li>
                  <li>
                    <Link
                      href={getLocalizedHref("/workshop")}
                      className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
                    >
                      <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
                      {t("multiCharacterStory")}
                    </Link>
                  </li>
                  <li>
                    <Link
                      href={getLocalizedHref("/workshop")}
                      className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
                    >
                      <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
                      {t("sceneComposition")}
                    </Link>
                  </li>
                  <li>
                    <Link
                      href={getLocalizedHref("/workshop")}
                      className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
                    >
                      <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
                      {t("styleConversion")}
                    </Link>
                  </li>
                  <li>
                    <Link
                      href={getLocalizedHref("/workshop")}
                      className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
                    >
                      <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
                      {t("communitySharing")}
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Contact us */}
              <div>
                <h4 className="text-lg font-semibold mb-6 text-foreground">
                  {tc("contactUs")}
                </h4>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3 text-muted-foreground">
                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Mail className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{tc("email")}</p>
                      <p className="text-xs text-muted-foreground">
                        contact@harjimi.ai
                      </p>
                    </div>
                  </li>
                  <li className="flex items-center gap-3 text-muted-foreground">
                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Globe className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{tc("website")}</p>
                      <p className="text-xs text-muted-foreground">
                        www.harjimi.ai
                      </p>
                    </div>
                  </li>
                  <li className="flex items-center gap-3 text-muted-foreground">
                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                      <MessageCircle className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {tc("customerService")}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {tc("onlineSupport")}
                      </p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-border/30 pt-8 mb-8">
              <div className="grid md:grid-cols-2 gap-6 items-center">
                {/* Copyright info */}
                <div className="text-muted-foreground text-sm">
                  <p>{tc("copyright")}</p>
                  <p className="mt-1">{tc("aiComicTech")}</p>
                </div>

                {/* Legal links */}
                <div className="flex flex-wrap gap-6 text-sm">
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    {tc("privacyPolicy")}
                  </Link>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    {tc("termsOfService")}
                  </Link>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    {tc("userAgreement")}
                  </Link>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    {tc("cookiePolicy")}
                  </Link>
                </div>
              </div>
            </div>

            {/* Bottom decoration */}
            <div className="text-center">
              <div className="inline-flex items-center gap-2 text-muted-foreground text-sm">
                <Sparkles className="w-4 h-4" />
                <span>{tc("createUnlimitedPossibilities")}</span>
                <Sparkles className="w-4 h-4" />
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
