"use client";

import React from "react";
import { MessageCircle, Phone, MapPin } from "lucide-react";
import settingsData from "@/data/settings.json";
import ScrollReveal from "@/components/ui/ScrollReveal";

export function ContactBanner() {
  const cleanPhone = settingsData.brand.phone.replace(/\s+/g, "");

  return (
    <section className="py-16 md:py-20 bg-accent-soft/50 border-t border-border/80 select-none overflow-hidden">
      <div className="container mx-auto px-4 md:px-6 text-center max-w-3xl">
        <ScrollReveal direction="up" delay={0}>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-primary mb-8">
            Liên Hệ Với Chúng Tôi
          </h2>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href={settingsData.brand.zaloLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto flex items-center justify-center gap-2.5 bg-transparent border-2 border-[#3D2314] hover:bg-[#3D2314] text-[#3D2314] hover:text-white font-bold py-3 px-8 rounded-pill shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all"
            >
              <MessageCircle className="w-5 h-5" />
              <span>Zalo</span>
            </a>

            <a
              href={`tel:${cleanPhone}`}
              className="w-full sm:w-auto flex items-center justify-center gap-2.5 bg-primary hover:bg-primary-hover text-white font-bold py-3 px-8 rounded-pill shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all"
            >
              <Phone className="w-5 h-5" />
              <span>Hotline</span>
            </a>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

export default ContactBanner;
