"use client";

import { useState, useEffect } from "react";
import { SubscriptionPlan } from "@/types/credits";

export function useSubscriptionPlans() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await fetch("/api/subscription/plans");

      if (response.ok) {
        const data = await response.json();
        setPlans(data.plans || []);
      } else {
        setError("Failed to fetch plans");
      }
    } catch (err) {
      setError("Error fetching plans");
      console.error("Plans fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  // 按价格排序计划
  const sortedPlans = plans.sort((a, b) => a.price_cents - b.price_cents);

  // 获取免费计划
  const freePlan = sortedPlans.find((plan) => plan.id === "free");

  // 获取付费计划
  const paidPlans = sortedPlans.filter((plan) => plan.id !== "free");

  // 获取推荐计划（通常是第二便宜的付费计划）
  const recommendedPlan = paidPlans[0]; // premium计划

  return {
    plans: sortedPlans,
    freePlan,
    paidPlans,
    recommendedPlan,
    loading,
    error,
    refetch: fetchPlans,
  };
}
