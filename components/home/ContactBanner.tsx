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
          <span className="text-xs font-bold tracking-widest text-secondary uppercase block mb-2">
            Kết Nối Với Xưởng Gỗ
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-primary mb-4">
            Bạn Cần Tư Vấn Riêng Về Loại Gỗ Hay Kích Cỡ?
          </h2>
          <p className="text-sm md:text-base text-text-muted leading-relaxed mb-8">
            Đội ngũ nghệ nhân Mỹ Nghệ Đông Phong sẵn sàng quay video trực tiếp thớ vân, đo ni hạt vòng tay và tư vấn phong thủy hợp mệnh hoàn toàn miễn phí.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href={settingsData.brand.zaloLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto flex items-center justify-center gap-2.5 bg-transparent border-2 border-[#3D2314] hover:bg-[#3D2314] text-[#3D2314] hover:text-white font-bold py-3 px-8 rounded-pill shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all"
            >
              <MessageCircle className="w-5 h-5" />
              <span>Chat Zalo Với Nghệ Nhân</span>
            </a>

            <a
              href={`tel:${cleanPhone}`}
              className="w-full sm:w-auto flex items-center justify-center gap-2.5 bg-primary hover:bg-primary-hover text-white font-bold py-3 px-8 rounded-pill shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all"
            >
              <Phone className="w-5 h-5" />
              <span>Gọi Hotline: {settingsData.brand.phone}</span>
            </a>
          </div>

          <div className="mt-8 flex items-center justify-center gap-2 text-xs text-text-muted">
            <MapPin className="w-4 h-4 text-secondary" />
            <span>Ghé thăm xưởng chế tác: {settingsData.brand.address}</span>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

export default ContactBanner;
