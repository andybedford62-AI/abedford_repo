import Stripe from "stripe";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("STRIPE_SECRET_KEY is not set");
    }
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2024-11-20.acacia",
      typescript: true,
    });
  }
  return _stripe;
}

export const PLANS = {
  FREE: {
    name: "Free",
    price: 0,
    priceId: null,
    features: {
      maxUsers: 3,
      maxProjects: 2,
      aiQueriesPerMonth: 100,
      analytics: false,
      customIntegrations: false,
    },
  },
  STARTER: {
    name: "Starter",
    price: 1200,
    priceId: process.env.STRIPE_STARTER_PRICE_ID,
    features: {
      maxUsers: 10,
      maxProjects: 10,
      aiQueriesPerMonth: 1000,
      analytics: true,
      customIntegrations: false,
    },
  },
  PRO: {
    name: "Pro",
    price: 2900,
    priceId: process.env.STRIPE_PRO_PRICE_ID,
    features: {
      maxUsers: 25,
      maxProjects: -1,
      aiQueriesPerMonth: 5000,
      analytics: true,
      customIntegrations: true,
    },
  },
  ENTERPRISE: {
    name: "Enterprise",
    price: 9900,
    priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID,
    features: {
      maxUsers: -1,
      maxProjects: -1,
      aiQueriesPerMonth: -1,
      analytics: true,
      customIntegrations: true,
    },
  },
} as const;

export type PlanKey = keyof typeof PLANS;
