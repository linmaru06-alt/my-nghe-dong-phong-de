"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import settingsData from "@/data/settings.json";

export function HeroSection() {


  return (
    <>
      {/* ─── MOBILE VIEW (Stitch Screen 11: Mobile 1B - Trang Chủ App) ─── */}
      <section className="block md:hidden px-4 pt-[72px] pb-3 select-none">
        <div className="relative w-full h-[220px] rounded-[16px] overflow-hidden shadow-[0_8px_24px_rgba(107,63,31,0.16)] flex flex-col justify-end p-4">
          {/* Background Image with Warm Amber Scrim */}
          <div
            className="absolute inset-0 w-full h-full bg-cover bg-center"
            style={{
              backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuDTTRSjFeSJ2AV0NvX4sjOnhwDCkGmKO4p6Rhu2dc5_p-PI6li7jeD7f4RcWRwXQmYqHm62H2xFMH4I45PDyrz7G_3THAmcpZL1ii8QTwC8EQgon5KFchS4CNSxQs_xOZGkNqX3YNOEtYzvWiU3FN-LKEwldn0Dr9jJ0m_rDiYXRQF4OZxjy09zHc1TjJsPlvl4r-ZR98e3XHrU-zI7aX94XDzho3HEB0GyROxHCvvhG6Az2e36-nfOTg')`,
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#3D2314] via-[#3D2314]/75 to-transparent" />

          {/* Content Overlay */}
          <div className="relative z-10 flex flex-col items-start max-w-[290px]">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FEB783]/90 text-[#673C1C] text-[11px] font-semibold tracking-wide mb-1.5 backdrop-blur-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C8963E] animate-pulse" />
              <span>Bảo vật mộc xưa</span>
            </div>
            <h1 className="font-serif text-xl sm:text-2xl text-white leading-tight font-bold tracking-wide drop-shadow-sm">
              Vòng tay gỗ quý tuyển chọn
            </h1>
            <p className="text-xs text-[#FEDCC8] line-clamp-1 mt-1 font-normal opacity-95">
              Phôi già trăm năm tích tụ linh khí đất trời
            </p>
            <div className="mt-2.5 flex items-center gap-2">
              <Link
                href="/san-pham?category=vong-tay"
                className="inline-flex items-center gap-1 bg-white text-[#50290B] px-3.5 py-1.5 rounded-full shadow-md text-xs font-bold transition-transform active:scale-95"
              >
                <span>Xem ngay</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>

            </div>
          </div>

          {/* Pagination Indicators */}
          <div className="absolute bottom-3 right-4 z-10 flex items-center gap-1.5">
            <span className="w-5 h-1.5 rounded-full bg-[#FEB783] transition-all" />
            <span className="w-1.5 h-1.5 rounded-full bg-white/60" />
            <span className="w-1.5 h-1.5 rounded-full bg-white/60" />
          </div>
        </div>
      </section>

      {/* ─── DESKTOP VIEW (Stitch Screen 15: Desktop 1 - Trang Chủ) ─── */}
      <section className="relative w-full -mt-20 overflow-hidden bg-primary text-white min-h-[640px] lg:min-h-[760px] hidden md:flex items-center select-none">
        {/* Background Image from Stitch */}
        <div className="absolute inset-0 z-0">
          <div
            className="w-full h-full bg-cover bg-center opacity-40 scale-105 transition-transform duration-1000 ease-out"
            style={{
              backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuDOqEINELNhogS-gBuKHsu4WSrr10syYzotQSdDiqCs9XvDc8EBls4LXubnhkVqZjyfsOnbl5hmLURkrXOQnJbP3IsmVQdbjbogh1U7rh-t_aDvogzdfu7xNfFPrLrYrGNcPnlE464IVS7-0rAz6JELEHpypEGz_w00Ul8YsgiBQdeyJ5wTpw2sB2WOtMqL5R88bxBTGvyCEJJ2HMCfPNQ8jcFk63MIpOeIeFa3I5J5fpGHkufbOyEdaA')`,
            }}
          />
          <div className="absolute inset-0 bg-[#2C1A0E]/75" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-[1320px] w-full mx-auto px-4 md:px-8 pt-32 pb-20 flex flex-col justify-between items-start">
          <div className="max-w-3xl flex flex-col space-y-5">
            {/* Eyebrow badge with amber pulse */}
            <div className="inline-flex items-center gap-2 self-start px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[#E0C097]">
              <span className="w-2 h-2 rounded-full bg-[#C8963E] animate-pulse" />
              <span className="text-[13px] tracking-[0.25em] uppercase font-semibold">
                ĐỒ MỸ NGHỆ GỖ QUÝ THỦ CÔNG
              </span>
            </div>

            {/* Heading */}
            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold tracking-wide text-white leading-[1.25]">
              Tinh hoa từ những <br className="hidden sm:inline" />
              <span className="italic font-normal tracking-wide text-[#E8BF87]">thớ gỗ quý ngàn năm</span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl text-[#F5D3C0] font-light max-w-2xl leading-relaxed">
              Mỗi tác phẩm là kết tinh của thời gian, thổ nhưỡng ngàn năm và đôi bàn tay tài hoa của nghệ nhân làng mộc truyền thống Đông Phong.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-4">
              <Link
                href="#danh-muc"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-white font-semibold text-base transition-all duration-300 shadow-lg hover:-translate-y-0.5 bg-primary hover:bg-primary-hover"
              >
                <span>Khám phá sản phẩm</span>
                <ArrowRight className="w-4 h-4" />
              </Link>


            </div>
          </div>


        </div>
      </section>
    </>
  );
}

export default HeroSection;
