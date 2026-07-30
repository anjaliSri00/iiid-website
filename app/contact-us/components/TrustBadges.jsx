// app/contact/components/TrustBadges.js
"use client";

import { Clock, Headphones, Shield, ThumbsUp } from "lucide-react";

export default function TrustBadges() {
  const badges = [
    {
      icon: Clock,
      title: "48hr Response",
      description: "Quick replies",
    },
    {
      icon: Headphones,
      title: "Expert Support",
      description: "Knowledgeable team",
    },
    {
      icon: Shield,
      title: "100% Secure",
      description: "Privacy guaranteed",
    },
    {
      icon: ThumbsUp,
      title: "Satisfaction",
      description: "We value you",
    },
  ];

  return (
    <section className="py-8 border-t border-gray-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {badges.map((badge, index) => (
            <div key={index} className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-[#CC0000]/10 rounded-full flex items-center justify-center mb-2">
                <badge.icon className="w-6 h-6 text-[#CC0000]" />
              </div>
              <p className="text-sm font-medium text-gray-700">{badge.title}</p>
              <p className="text-xs text-gray-400">{badge.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}