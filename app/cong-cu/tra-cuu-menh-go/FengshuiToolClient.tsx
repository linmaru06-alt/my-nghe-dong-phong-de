"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Sparkles, Compass, ShieldCheck, MessageCircle, Phone, ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";
import { calculateFengshui, type FengshuiResult } from "@/lib/utils/fengshui";
import settingsData from "@/data/settings.json";

export default function FengshuiToolClient() {
  const [selectedYear, setSelectedYear] = useState<number>(1988);
  const [selectedGender, setSelectedGender] = useState<"nam" | "nu">("nam");
  const [hasSearched, setHasSearched] = useState<boolean>(true);

  // Generate birth years list (1950 to 2025)
  const years = useMemo(() => {
    const list: number[] = [];
    for (let y = 2026; y >= 1950; y--) {
      list.push(y);
    }
    return list;
  }, []);

  const result: FengshuiResult = useMemo(() => {
    return calculateFengshui(selectedYear, selectedGender);
  }, [selectedYear, selectedGender]);

  const zaloConsultUrl = useMemo(() => {
    const phone = settingsData.brand.phone.replace(/\D/g, "");
    const msg = `Chào Mỹ Nghệ Đông Phong, tôi sinh năm ${result.year} (${result.canChi} - Mệnh ${result.napAm}). Tôi muốn được nghệ nhân tư vấn chuỗi vòng gỗ quý phong thủy hộ mệnh hợp tuổi ạ.`;
    return `https://zalo.me/${phone || "0961668612"}?text=${encodeURIComponent(msg)}`;
  }, [result]);

  return (
    <div className="w-full">
      {/* ─── FORM CHỌN NĂM SINH & BẢN MỆNH ─── */}
      <div className="bg-[#FAF6F0] border border-[#E8DFC8] rounded-3xl p-6 md:p-10 shadow-sm mb-10">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C5A059]/10 text-[#C5A059] text-xs font-bold uppercase tracking-wider mb-3">
            <Compass className="w-4 h-4 text-[#C5A059]" />
            <span>Thuật Toán Tứ Trụ Ngũ Hành</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-[#3D2314] mb-3">
            Tra Cứu Bản Mệnh & Linh Mộc Tương Sinh
          </h2>
          <p className="text-sm md:text-base text-[#5A4A42] leading-relaxed">
            Chọn năm sinh âm lịch để giải mã Can Chi, Ngũ Hành Nạp Âm và tìm ra phôi gỗ quý mang trường năng lượng trợ mệnh cát lành nhất.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6 max-w-3xl mx-auto items-end">
          {/* Select Năm Sinh */}
          <div className="md:col-span-6">
            <label htmlFor="birth-year" className="block text-xs font-bold uppercase tracking-wider text-[#3D2314] mb-2">
              Năm sinh (Âm lịch / Dương lịch)
            </label>
            <select
              id="birth-year"
              value={selectedYear}
              onChange={(e) => {
                setSelectedYear(Number(e.target.value));
                setHasSearched(true);
              }}
              className="w-full h-12 px-4 rounded-xl border border-[#D5C7B0] bg-white text-[#3D2314] font-medium text-base focus:outline-hidden focus:border-[#C5A059] focus:ring-2 focus:ring-[#C5A059]/20 transition-all shadow-xs"
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  Năm {y}
                </option>
              ))}
            </select>
          </div>

          {/* Select Giới Tính */}
          <div className="md:col-span-6">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#3D2314] mb-2">
              Giới tính người đeo
            </label>
            <div className="grid grid-cols-2 gap-3 h-12">
              <button
                type="button"
                onClick={() => setSelectedGender("nam")}
                className={`flex items-center justify-center rounded-xl font-medium text-sm transition-all border ${
                  selectedGender === "nam"
                    ? "bg-[#3D2314] text-white border-[#3D2314] shadow-xs"
                    : "bg-white text-[#5A4A42] border-[#D5C7B0] hover:border-[#3D2314]"
                }`}
              >
                Nam Giới
              </button>
              <button
                type="button"
                onClick={() => setSelectedGender("nu")}
                className={`flex items-center justify-center rounded-xl font-medium text-sm transition-all border ${
                  selectedGender === "nu"
                    ? "bg-[#3D2314] text-white border-[#3D2314] shadow-xs"
                    : "bg-white text-[#5A4A42] border-[#D5C7B0] hover:border-[#3D2314]"
                }`}
              >
                Nữ Giới
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ─── KẾT QUẢ TRA CỨU CHI TIẾT ─── */}
      {hasSearched && (
        <div className="space-y-8 animate-fadeIn">
          {/* Card Tổng Quan Bản Mệnh */}
          <div className="bg-gradient-to-br from-[#3D2314] to-[#25150C] rounded-3xl p-6 md:p-10 text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#C5A059]/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-6 border-b border-white/10">
                <div>
                  <span className="text-xs uppercase tracking-widest text-[#C5A059] font-bold block mb-1">
                    Lá Số Ngũ Hành Cát Lành
                  </span>
                  <h3 className="text-3xl md:text-4xl font-serif font-bold text-white tracking-wide">
                    {result.canChi} ({result.year})
                  </h3>
                </div>
                <div className="px-5 py-2.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-center">
                  <span className="text-[11px] block text-white/70 uppercase tracking-wider">Hành Bản Mệnh</span>
                  <span className="text-xl font-serif font-bold text-[#C5A059]">Mệnh {result.menhNguHanh}</span>
                </div>
              </div>

              {/* Tên Nạp Âm & Ý Nghĩa */}
              <div className="mb-8">
                <div className="inline-block px-3 py-1 rounded-lg bg-[#C5A059]/20 text-[#E8DFC8] font-mono text-sm font-bold mb-2">
                  Nạp Âm: {result.napAm}
                </div>
                <p className="text-base md:text-lg text-[#E8DFC8] font-serif italic leading-relaxed">
                  &ldquo;{result.napAmMeaning}&rdquo;
                </p>
              </div>

              {/* 2 Cột Tương Sinh & Tương Hợp */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 pt-6 border-t border-white/10">
                <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
                  <div className="flex items-center gap-2 text-[#C5A059] font-bold text-sm mb-2">
                    <Sparkles className="w-4 h-4 text-[#C5A059]" />
                    <span>Năng Lượng Tương Sinh (Tốt Nhất)</span>
                  </div>
                  <p className="text-white font-medium text-sm mb-1">{result.tuongSinh.hanh}</p>
                  <p className="text-xs text-[#E8DFC8]/80 leading-relaxed mb-3">{result.tuongSinh.description}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {result.tuongSinh.colors.map((c, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-md bg-white/10 text-white text-[11px] font-medium">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
                  <div className="flex items-center gap-2 text-[#E8DFC8] font-bold text-sm mb-2">
                    <CheckCircle2 className="w-4 h-4 text-[#C5A059]" />
                    <span>Năng Lượng Tương Hợp (Bản Mệnh)</span>
                  </div>
                  <p className="text-white font-medium text-sm mb-1">{result.tuongHop.hanh}</p>
                  <p className="text-xs text-[#E8DFC8]/80 leading-relaxed mb-3">{result.tuongHop.description}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {result.tuongHop.colors.map((c, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-md bg-white/10 text-white text-[11px] font-medium">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ─── DANH SÁCH LINH MỘC KHUYÊN DÙNG ─── */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl md:text-2xl font-serif font-bold text-[#3D2314]">
                  Linh Mộc Hộ Thân Dành Riêng Cho Người Tuổi {result.canChi}
                </h3>
                <p className="text-xs md:text-sm text-[#5A4A42]">
                  Được nghệ nhân Đông Phong chọn lọc theo trường năng lượng ngũ hành tương sinh
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {result.khuyenDungWoods.map((wood, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-2xl border border-[#E8DFC8] p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div>
                    <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#C5A059]/15 text-[#C5A059] text-[11px] font-bold mb-3">
                      {wood.highlight}
                    </span>
                    <h4 className="font-serif font-bold text-lg text-[#3D2314] mb-2 group-hover:text-[#C5A059] transition-colors">
                      {wood.name}
                    </h4>
                    <p className="text-xs md:text-sm text-[#5A4A42] leading-relaxed mb-4">
                      {wood.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-[#E8DFC8]/60 flex items-center justify-between">
                    <Link
                      href={wood.productCategory === "but-ky" ? "/san-pham/but-ky" : wood.productCategory === "goi-go" ? "/san-pham/goi-go" : wood.productCategory === "bi-lan-tay" ? "/san-pham/bi-lan-tay" : "/san-pham/vong-tay"}
                      className="text-xs font-bold text-[#3D2314] hover:text-[#C5A059] inline-flex items-center gap-1 transition-colors"
                    >
                      <span>Xem tác phẩm</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                    <a
                      href={zaloConsultUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-medium text-[#C5A059] hover:underline"
                    >
                      Tư vấn mẫu mộc
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ─── LỜI KHUYÊN & KIÊNG KỴ ─── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#FAF6F0] rounded-2xl p-6 border border-[#E8DFC8]">
              <div className="flex items-center gap-2 text-[#3D2314] font-serif font-bold text-base mb-3">
                <ShieldCheck className="w-5 h-5 text-[#C5A059]" />
                <span>Lời Khuyên Dưỡng Khí Từ Nghệ Nhân</span>
              </div>
              <p className="text-sm text-[#5A4A42] leading-relaxed">
                {result.loiKhuyenNgheNhan}
              </p>
            </div>

            <div className="bg-[#FAF6F0] rounded-2xl p-6 border border-[#E8DFC8]">
              <div className="flex items-center gap-2 text-[#3D2314] font-serif font-bold text-base mb-3">
                <AlertCircle className="w-5 h-5 text-amber-700" />
                <span>Lưu Ý Tránh Xung Khắc Năng Lượng</span>
              </div>
              <p className="text-sm text-[#5A4A42] leading-relaxed">
                {result.kiengKy}
              </p>
            </div>
          </div>

          {/* ─── BANNER CHUYỂN ĐỔI ZALO CÁ NHÂN HÓA ─── */}
          <div className="bg-[#FAF6F0] border-2 border-[#C5A059]/40 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
            <div className="max-w-xl">
              <span className="text-xs uppercase font-bold tracking-wider text-[#C5A059] block mb-1">
                Tư Vấn Cá Nhân Hóa 1-1 Miễn Phí
              </span>
              <h4 className="font-serif font-bold text-xl md:text-2xl text-[#3D2314] mb-2">
                Bạn muốn xem vân gỗ thật của người tuổi {result.canChi}?
              </h4>
              <p className="text-sm text-[#5A4A42] leading-relaxed">
                Nghệ nhân xưởng Đông Phong sẵn sàng quay video trực tiếp cận cảnh từng phôi mộc tự nhiên theo đúng năm sinh của bạn trước khi tiện hạt.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <a
                href={zaloConsultUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#06C755] hover:bg-[#05a847] text-white font-bold text-sm shadow-md transition-all active:scale-95"
              >
                <MessageCircle className="w-4 h-4 fill-white text-[#06C755]" />
                <span>Nhắn Zalo Nghệ Nhân</span>
              </a>
              <a
                href={`tel:${settingsData.brand.phone.replace(/\s+/g, "")}`}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white border border-[#D5C7B0] hover:border-[#3D2314] text-[#3D2314] font-bold text-sm transition-all"
              >
                <Phone className="w-4 h-4" />
                <span>Hotline: {settingsData.brand.phone}</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
