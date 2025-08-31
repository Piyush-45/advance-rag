"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowRight,
  Upload,
  MessageSquare,
  BarChart3,
  Share2,
  Check,
  Sparkles,
} from "lucide-react";

export default function LandingPage() {
  const [isVisible, setIsVisible] = useState(false);
  const router = useRouter();


  useEffect(() => {
    setIsVisible(true);
  }, []);

  const features = [
    {
      icon: Upload,
      title: "Upload once, use everywhere",
      desc: "Drag & drop your PDF. VenueBot auto-parses, chunks, and indexes securely.",
    },
    {
      icon: MessageSquare,
      title: "Accurate answers",
      desc: "Every reply is grounded in your document, with page and section citations.",
    },
    {
      icon: BarChart3,
      title: "Guest analytics",
      desc: "See what guests ask the most — from pricing to facilities.",
    },
    {
      icon: Share2,
      title: "Easy embed & sharing",
      desc: "Generate a secure link or drop the widget onto your site — no developer needed.",
    },
  ];

  const benefits = [
    "1 brochure",
    "Unlimited chats",
    "Basic analytics",
    "Secure sharing & embed",
    "24/7 availability",
    "Source citations",
  ];

  return (
    <main className="bg-white text-gray-900 overflow-hidden">
      {/* Hero Section */}
      <section className="max-w-4xl mx-auto px-6 pt-20 pb-32 text-center">
        <div
          className={`transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-sm mb-8">
            <span className="w-2 h-2 bg-indigo-400 rounded-full mr-2"></span>
            Free during beta
          </div>

          <h1 className="text-5xl md:text-7xl font-semibold tracking-tight mb-6 leading-[1.1]">
            Turn your venue brochure into a{" "}
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              smart assistant
            </span>
          </h1>

          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-12 leading-relaxed">
            Guests ask about capacity, pricing, packages. VenueBot gives instant,
            accurate answers with citations. No more inbox overload.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
            <Button
              size="lg"
              className="bg-gray-900 text-white hover:bg-gray-800 transition-all duration-200 px-8 py-3 text-base font-medium group"
              onClick={() => router.push("/api/auth/signin")}
            >
              Start Free
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="border-gray-300 hover:border-gray-400 transition-colors px-8 py-3 text-base"
              onClick={() => router.push("/chat")}
            >
              Try Demo
            </Button>
          </div>

          <p className="text-sm text-gray-500">
            No credit card required • You own your data • Ready in 2 minutes
          </p>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-6xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-semibold mb-4">How it works</h2>
          <p className="text-gray-600 text-lg">Simple, powerful, reliable</p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <Card
                key={i}
                className="border-0 shadow-sm hover:shadow-md transition-all duration-300 bg-white group"
              >
                <CardContent className="p-8">
                  <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-indigo-50 transition-colors">
                    <Icon className="w-6 h-6 text-gray-600 group-hover:text-indigo-600 transition-colors" />
                  </div>
                  <h3 className="font-semibold text-lg mb-3 text-gray-900">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.desc}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24">
        <div className="max-w-2xl mx-auto text-center px-6">
          <h2 className="text-3xl font-semibold mb-4">
            Simple, transparent pricing
          </h2>
          <p className="text-gray-600 mb-16 text-lg">
            Free during beta — includes everything you need to get started.
          </p>

          <Card className="border border-gray-200 shadow-sm max-w-md mx-auto">
            <CardContent className="p-10">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-semibold mb-2">Free Beta</h3>
                <div className="text-4xl font-semibold mb-2">$0</div>
                <div className="text-gray-500">During beta period</div>
              </div>

              <ul className="space-y-3 mb-8">
                {benefits.map((benefit, i) => (
                  <li key={i} className="flex items-center text-gray-700">
                    <Check className="w-5 h-5 text-indigo-600 mr-3 flex-shrink-0" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>

              <Button
                size="lg"
                className="w-full bg-gray-900 text-white hover:bg-gray-800 transition-colors font-medium"
                onClick={() => router.push("/api/auth/signin")}
              >
                Create Free Account
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-gradient-to-br from-gray-900 to-gray-800 text-white py-24">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-semibold mb-6 leading-tight">
            Stop repeating the same answers.
            <br />
            <span className="text-gray-300">Let VenueBot handle your FAQs.</span>
          </h2>

          <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
            Join venue owners who&apos;ve already saved hours of manual work.
          </p>

          <Button
            size="lg"
            className="bg-white text-gray-900 hover:bg-gray-100 transition-colors px-8 py-3 text-base font-medium group"
            onClick={() => router.push("/api/auth/signin")}
          >
            Start Free Today
            <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Button>

          <p className="mt-6 text-sm text-gray-400">Ready in under 2 minutes</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-6 h-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-md flex items-center justify-center">
                <Sparkles className="w-3 h-3 text-white" />
              </div>
              <span className="font-semibold">VenueBot</span>
            </div>

            <div className="flex items-center space-x-8 text-sm text-gray-600">
              <Link href="#features">Features</Link>
              <Link href="#pricing">Pricing</Link>
              <Link href="/chat">Demo</Link>
              <Link href="/api/auth/signin">Sign in</Link>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-100 text-center text-sm text-gray-500">
            © 2025 VenueBot. All rights reserved.
          </div>
        </div>
      </footer>
    </main>
  );
}
