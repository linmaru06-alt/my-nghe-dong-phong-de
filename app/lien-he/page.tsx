import React from "react";
import { MessageCircle, Phone, MapPin, Clock, HelpCircle, ShoppingBag, Facebook, Sparkles } from "lucide-react";
import Breadcrumb from "@/components/ui/Breadcrumb";
import Accordion from "@/components/ui/Accordion";
import settingsData from "@/data/settings.json";

export const metadata = {
  title: "Liên Hệ & Tư Vấn Thỉnh Gỗ Quý | Mỹ Nghệ Đông Phong",
  description:
    "Thông tin liên hệ hotline, Zalo chính thức, gian hàng Shopee và Facebook xưởng chế tác thủ công Mỹ Nghệ Đông Phong. Trực tiếp giải đáp thắc mắc khách hàng 24/7.",
};

export default function ContactPage() {
  const phone = settingsData.brand.phone;
  const cleanPhone = phone.replace(/\s+/g, "");
  const zaloLink = settingsData.brand.zaloLink;
  const shopeeLink =
    (settingsData as any).brand?.shopeeLink ||
    (settingsData as any).shopeeLink ||
    "https://vn.shp.ee/JdnPvA3B";
  const facebookLink =
    (settingsData as any).brand?.facebook ||
    (settingsData as any).facebook ||
    settingsData.socialLinks?.facebook ||
    "https://www.facebook.com/phong.nk.12";

  // Convert FAQs from settings.json into Accordion format
  const faqItems = settingsData.faq.map((item, index) => ({
    id: `faq-${index}`,
    title: item.q,
    defaultOpen: index === 0,
    content: item.a,
  }));

  return (
    <main className="flex-1 w-full bg-bg py-8 md:py-12 select-none">
      <div className="container mx-auto px-4 md:px-6">
        <Breadcrumb items={[{ label: "Liên hệ & Tư vấn" }]} />

        {/* Header */}
        <div className="text-center max-w-2xl mx-auto my-8">
          <span className="text-xs font-bold tracking-widest text-secondary uppercase block mb-2">
            Kết Nối Trực Tiếp
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-primary mb-3">
            Tư Vấn & Đặt Hàng Theo Yêu Cầu
          </h1>
          <p className="text-sm md:text-base text-text-muted leading-relaxed">
            Chúng tôi luôn sẵn sàng lắng nghe và giải đáp mọi thắc mắc về phân biệt vân gỗ, tư vấn hợp mệnh và chế tác đo ni riêng.
          </p>
        </div>

        {/* 3 Contact Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-10">
          {/* 1. Zalo Card */}
          <div className="p-8 rounded-card bg-surface border border-border shadow-card hover:shadow-xl transition-all duration-300 flex flex-col justify-between text-center group">
            <div>
              <div className="w-14 h-14 rounded-full bg-accent-soft text-primary flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <MessageCircle className="w-7 h-7" />
              </div>
              <h3 className="font-serif text-lg font-bold text-text mb-2">
                Zalo Nghệ Nhân
              </h3>
              <p className="text-xs text-text-muted mb-6 leading-relaxed">
                Nhắn tin xem video cận cảnh từng thớ vân, tia chớp của phôi gỗ trước khi giao dịch.
              </p>
            </div>
            <a
              href={zaloLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 px-4 rounded-btn bg-primary hover:bg-primary-hover text-white text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Nhắn Tin Zalo ({phone})</span>
            </a>
          </div>

          {/* 2. Hotline Card */}
          <div className="p-8 rounded-card bg-surface border border-border shadow-card hover:shadow-xl transition-all duration-300 flex flex-col justify-between text-center group">
            <div>
              <div className="w-14 h-14 rounded-full bg-accent-soft text-primary flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Phone className="w-7 h-7" />
              </div>
              <h3 className="font-serif text-lg font-bold text-text mb-2">
                Đường Dây Nóng
              </h3>
              <p className="text-xs text-text-muted mb-6 leading-relaxed">
                Tư vấn nhanh về thông số kích thước hạt, thời giá gỗ và tình trạng sẵn hàng.
              </p>
            </div>
            <a
              href={`tel:${cleanPhone}`}
              className="w-full py-3 px-4 rounded-btn bg-primary hover:bg-primary-hover text-white text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-2"
            >
              <Phone className="w-4 h-4" />
              <span>Gọi {phone}</span>
            </a>
          </div>

          {/* 3. Workshop Address Card */}
          <div className="p-8 rounded-card bg-surface border border-border shadow-card hover:shadow-xl transition-all duration-300 flex flex-col justify-between text-center group">
            <div>
              <div className="w-14 h-14 rounded-full bg-accent-soft text-primary flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <MapPin className="w-7 h-7" />
              </div>
              <h3 className="font-serif text-lg font-bold text-text mb-2">
                Địa Chỉ Xưởng Mộc
              </h3>
              <p className="text-xs text-text-muted mb-2 leading-relaxed">
                {settingsData.brand.address}
              </p>
              <div className="text-xs text-text-muted flex items-center justify-center gap-1.5 mb-6">
                <Clock className="w-3.5 h-3.5 text-secondary" />
                <span>{settingsData.brand.businessHours}</span>
              </div>
            </div>
            <a
              href={`https://maps.google.com/?q=${encodeURIComponent(settingsData.brand.address)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 px-4 rounded-btn bg-primary hover:bg-primary-hover text-white text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-2"
            >
              <MapPin className="w-4 h-4" />
              <span>Chỉ Đường</span>
            </a>
          </div>
        </div>

        {/* Official Online Channels: Shopee & Facebook */}
        <div className="max-w-5xl mx-auto mb-16">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-4 h-4 text-accent-gold" />
            <h2 className="font-serif text-base font-bold text-primary uppercase tracking-wide">
              Kênh Mua Sắm & Mạng Xã Hội Chính Thức
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Shopee Card */}
            <div className="p-6 md:p-7 rounded-card bg-surface border border-border shadow-card hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
              <div>
                <div className="flex items-center gap-3.5 mb-3.5">
                  <div className="w-12 h-12 rounded-xl bg-accent-soft text-primary flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                    <ShoppingBag className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-bold text-text">
                      Gian Hàng Shopee Chính Hãng
                    </h3>
                    <span className="text-[11px] text-text-muted font-medium block">
                      Đảm bảo chính hãng • Miễn phí vận chuyển
                    </span>
                  </div>
                </div>
                <p className="text-xs text-text-muted mb-6 leading-relaxed">
                  Đặt mua nhanh chóng, áp dụng voucher giảm giá sàn Shopee, thanh toán an toàn và nhận hàng kiểm tra toàn quốc.
                </p>
              </div>
              <a
                href={shopeeLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-4 rounded-btn bg-primary hover:bg-primary-hover text-white text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Ghé Thăm Shopee</span>
              </a>
            </div>

            {/* Facebook Card */}
            <div className="p-6 md:p-7 rounded-card bg-surface border border-border shadow-card hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
              <div>
                <div className="flex items-center gap-3.5 mb-3.5">
                  <div className="w-12 h-12 rounded-xl bg-accent-soft text-primary flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                    <Facebook className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-bold text-text">
                      Trang Facebook Xưởng Mộc
                    </h3>
                    <span className="text-[11px] text-text-muted font-medium block">
                      Cập nhật phôi gỗ & Video chế tác mỗi ngày
                    </span>
                  </div>
                </div>
                <p className="text-xs text-text-muted mb-6 leading-relaxed">
                  Theo dõi không gian xưởng, giao lưu cùng nghệ nhân Đông Phong và xem cận cảnh các tác phẩm độc bản vừa hoàn thiện.
                </p>
              </div>
              <a
                href={facebookLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-4 rounded-btn bg-primary hover:bg-primary-hover text-white text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-2"
              >
                <Facebook className="w-4 h-4" />
                <span>Kết Nối Facebook</span>
              </a>
            </div>
          </div>
        </div>

        {/* Map Placeholder */}
        <div className="max-w-5xl mx-auto mb-16 rounded-card overflow-hidden border border-border bg-surface shadow-card">
          <div className="p-4 bg-bg border-b border-border flex items-center justify-between">
            <span className="text-xs font-semibold text-text flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" /> Bản Đồ Vị Trí Xưởng Chế Tác
            </span>
            <span className="text-[11px] text-text-muted">Đông Anh, Hà Nội</span>
          </div>
          <div className="h-64 sm:h-80 w-full bg-[#EFE9E0] flex flex-col items-center justify-center text-center p-6 text-text-muted">
            <MapPin className="w-10 h-10 text-primary mb-2 opacity-60 animate-bounce" />
            <p className="font-serif text-base font-bold text-text mb-1">
              Xưởng Gỗ Thủ Công Mỹ Nghệ Đông Phong
            </p>
            <p className="text-xs max-w-sm mb-4">
              {settingsData.brand.address}
            </p>
            <a
              href={`https://maps.google.com/?q=${encodeURIComponent(settingsData.brand.address)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-bold text-primary hover:underline"
            >
              Mở trên Google Maps →
            </a>
          </div>
        </div>

        {/* FAQ Accordion Section */}
        <section id="chinh-sach" className="max-w-3xl mx-auto pt-8 border-t border-border">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-secondary mb-2">
              <HelpCircle className="w-4 h-4" />
              <span>Câu Hỏi Thường Gặp</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-primary">
              Giải Đáp Thắc Mắc & Chính Sách
            </h2>
          </div>

          <div className="bg-surface p-6 md:p-8 rounded-card border border-border shadow-card">
            <Accordion items={faqItems} />
          </div>
        </section>
      </div>
    </main>
  );
}
