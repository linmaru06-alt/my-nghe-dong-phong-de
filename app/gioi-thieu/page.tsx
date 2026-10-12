import React from "react";
import Link from "next/link";
import { ShieldCheck, Heart, Sparkles, MapPin, MessageCircle } from "lucide-react";
import Breadcrumb from "@/components/ui/Breadcrumb";
import settingsData from "@/data/settings.json";

export const metadata = {
  title: "Về Thương Hiệu Mỹ Nghệ Đông Phong | Tinh Hoa Đồ Gỗ Quý",
  description:
    "Câu chuyện khởi nghiệp, gìn giữ tinh hoa nghề mộc thủ công truyền thống và tâm huyết chế tác gỗ quý của Mỹ Nghệ Đông Phong.",
};

export default function AboutPage() {
  const values = [
    {
      icon: ShieldCheck,
      title: "Chân Thật Về Nguồn Gỗ",
      desc: "Mỗi phôi gỗ Tử Đàn, Sưa Đỏ hay Nu Bách Xanh đều được thẩm định tuổi thớ cẩn trọng. Không pha tạp, không phủ vân màu giả lập.",
    },
    {
      icon: Heart,
      title: "Tâm Huyết Nghệ Nhân",
      desc: "Từng chuỗi hạt, chiếc bút ký được hoàn thiện qua hàng chục bước mài giũa tỉ mỉ từ những đôi bàn tay thợ cả làng nghề giàu thâm niên.",
    },
    {
      icon: Sparkles,
      title: "Văn Hóa & Phong Thủy",
      desc: "Tôn vinh giá trị phong thủy nguyên bản của từng hành mộc, giúp chủ nhân thỉnh được vật phẩm vừa sang trọng vừa an nhiên tinh thần.",
    },
  ];

  const stats = [
    { number: "100%", label: "Gỗ tự nhiên nguyên khối" },
    { number: "15+", label: "Năm lưu giữ tinh hoa mộc" },
    { number: "7", label: "Dòng sản phẩm độc bản" },
    { number: "10.000+", label: "Khách hàng tin chọn trên cả nước" },
  ];

  return (
    <main className="flex-1 w-full bg-bg py-8 md:py-12 select-none">
      <div className="container mx-auto px-4 md:px-6">
        <Breadcrumb items={[{ label: "Giới thiệu thương hiệu" }]} />

        {/* Core Values */}
        <section className="mt-8 mb-16 md:mb-24">
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="text-xs font-bold tracking-widest text-secondary uppercase block mb-2">
              Giá Trị Cốt Lõi
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-primary">
              Ba Tôn Chỉ Làm Nghề Bất Biến
            </h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((val, index) => {
              const Icon = val.icon;
              return (
                <div
                  key={index}
                  className="p-8 rounded-card bg-surface border border-border shadow-card flex flex-col items-start"
                >
                  <div className="w-12 h-12 rounded-full bg-accent-soft flex items-center justify-center text-primary mb-5">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-serif text-lg font-bold text-text mb-2">
                    {val.title}
                  </h3>
                  <p className="text-sm text-text-muted leading-relaxed">
                    {val.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Stats Row */}
        <section className="mb-16 md:mb-24 py-12 px-6 rounded-card bg-primary text-white border border-[#4E2D12]">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center divide-y lg:divide-y-0 lg:divide-x divide-white/15">
            {stats.map((stat, i) => (
              <div key={i} className="pt-6 lg:pt-0 lg:px-4 first:pt-0">
                <span className="font-serif text-3xl md:text-4xl font-bold text-[#D4AF37] block mb-1">
                  {stat.number}
                </span>
                <span className="text-xs md:text-sm text-white/80">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Workshop Visit & CTA */}
        <section className="max-w-3xl mx-auto text-center p-8 md:p-12 rounded-card bg-surface border border-border shadow-card">
          <div className="w-12 h-12 rounded-full bg-accent-soft flex items-center justify-center text-primary mx-auto mb-4">
            <MapPin className="w-6 h-6" />
          </div>
          <h2 className="font-serif text-2xl md:text-3xl font-bold text-primary mb-3">
            Mời Quý Khách Ghé Thăm Xưởng Mộc
          </h2>
          <p className="text-sm text-text-muted leading-relaxed mb-6">
            Mỹ Nghệ Đông Phong luôn rộng mở cánh cửa đón tiếp quý khách hữu duyên tới đàm đạo trà đạo, tận tay sờ ngắm và cảm nhận hương thơm tự nhiên của từng thớ gỗ nguyên bản.
          </p>
          <div className="p-4 rounded-lg bg-bg text-xs text-text-muted mb-8 max-w-md mx-auto">
            <span className="font-semibold text-text block mb-1">Địa chỉ xưởng:</span>
            {settingsData.brand.address}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href={settingsData.brand.zaloLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white font-bold py-3 px-6 rounded-btn text-sm transition-all"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Hẹn Giờ Ghé Thăm Qua Zalo</span>
            </a>
            <Link
              href="/san-pham"
              className="w-full sm:w-auto flex items-center justify-center px-6 py-3 rounded-btn border border-border hover:border-primary text-text hover:text-primary text-sm font-bold transition-colors"
            >
              Xem tác phẩm sẵn có
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
