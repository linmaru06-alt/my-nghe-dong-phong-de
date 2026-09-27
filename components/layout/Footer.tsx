"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Phone, MessageCircle, MapPin, Clock, ShieldCheck, HeartHandshake, Facebook, ShoppingBag } from "lucide-react";
import settingsData from "@/data/settings.json";
import { useSettingsStore } from "@/lib/useSettings";

export function Footer() {
  const pathname = usePathname();
  const { settings, loadSettings } = useSettingsStore();

  React.useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const brand = settings?.brand || settingsData.brand;
  const phone = brand?.phone || settingsData.brand.phone;
  const zaloLink = brand?.zaloLink || settingsData.brand.zaloLink;
  const facebookLink =
    brand?.facebook ||
    settings?.facebook ||
    settingsData.socialLinks.facebook ||
    "https://www.facebook.com/phong.nk.12";
  const shopeeLink =
    brand?.shopeeLink ||
    settings?.shopeeLink ||
    (settingsData as any).shopeeLink ||
    "https://vn.shp.ee/JdnPvA3B";
  const address = brand?.address || settingsData.brand.address;
  const businessHours = brand?.businessHours || settingsData.brand.businessHours;

  // Hide footer in admin dashboard
  if (pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <footer className="bg-[#23150D] text-[#E8DDD3] pt-14 pb-8 border-t border-[#3D2314] mt-auto select-none">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 pb-12 border-b border-[#3D2314]">
          {/* Col 1: Brand & Craft Philosophy (5 cols) */}
          <div className="lg:col-span-5 space-y-5">
            <div className="flex items-center gap-3">
              <img
                src="/images/logo.png"
                alt="Mỹ Nghệ Đông Phong"
                className="w-14 h-14 object-contain drop-shadow"
              />
              <div>
                <span className="font-serif text-2xl font-medium text-white block tracking-wide">
                  Mỹ Nghệ Đông Phong
                </span>
                <span className="text-xs text-[#C5A059] tracking-[0.18em] uppercase font-medium">
                  Tinh hoa từ những thớ gỗ quý
                </span>
              </div>
            </div>
            <p className="text-[13px] text-[#A8988C] font-light leading-relaxed max-w-sm">
              Chế tác mộc thủ công truyền thống từ các loại gỗ quý tự nhiên. Mỗi tác phẩm là một câu chuyện độc bản về thời gian và tâm huyết nghệ nhân.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <span className="inline-flex items-center gap-1.5 text-[11px] text-[#C5A059] uppercase tracking-wide font-medium border border-[#C5A059]/40 rounded-full px-3 py-1.5">
                <ShieldCheck className="w-4 h-4" /> Gỗ thật 100%
              </span>
              <span className="inline-flex items-center gap-1.5 text-[11px] text-[#C5A059] uppercase tracking-wide font-medium border border-[#C5A059]/40 rounded-full px-3 py-1.5">
                <HeartHandshake className="w-4 h-4" /> Bảo hành trọn đời
              </span>
            </div>
          </div>

          {/* Col 2: Quick Links (3 cols) */}
          <div className="lg:col-span-3 space-y-4">
            <h3 className="font-serif text-[15px] font-medium text-white tracking-widest uppercase">
              Liên Kết
            </h3>
            <ul className="space-y-3 text-[13px] text-[#A8988C] font-light">
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  Trang chủ
                </Link>
              </li>
              <li>
                <Link href="/san-pham" className="hover:text-white transition-colors">
                  Bộ sưu tập gỗ quý
                </Link>
              </li>
              <li>
                <Link href="/gioi-thieu" className="hover:text-white transition-colors">
                  Về thương hiệu Đông Phong
                </Link>
              </li>
              <li>
                <Link href="/bai-viet" className="hover:text-white transition-colors">
                  Cẩm nang & Kiến thức gỗ
                </Link>
              </li>
              <li>
                <Link href="/lien-he#chinh-sach" className="hover:text-white transition-colors">
                  Chính sách bảo hành
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Direct Contact (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <h3 className="font-serif text-[15px] font-medium text-white tracking-widest uppercase">
              Tư Vấn & Kết Nối
            </h3>
            <div className="space-y-4">
              <a
                href={`tel:${phone.replace(/\s+/g, "")}`}
                className="flex items-center gap-3 text-white hover:text-[#C5A059] transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-[#3D2314] flex items-center justify-center text-[#C5A059] flex-shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <span className="font-medium font-mono text-[15px] tracking-wide">{phone}</span>
              </a>

              <div className="flex items-center gap-3">
                <a
                  href={zaloLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-[#C5A059]/10 flex items-center justify-center text-[#C5A059] hover:bg-[#C5A059] hover:text-[#23150D] transition-all duration-300"
                  title="Zalo"
                >
                  <MessageCircle className="w-4 h-4" />
                </a>

                <a
                  href={shopeeLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-[#C5A059]/10 flex items-center justify-center text-[#C5A059] hover:bg-[#C5A059] hover:text-[#23150D] transition-all duration-300"
                  title="Shopee"
                >
                  <ShoppingBag className="w-4 h-4" />
                </a>

                <a
                  href={facebookLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-[#C5A059]/10 flex items-center justify-center text-[#C5A059] hover:bg-[#C5A059] hover:text-[#23150D] transition-all duration-300"
                  title="Facebook"
                >
                  <Facebook className="w-4 h-4" />
                </a>
              </div>

              <div className="flex items-start gap-3 text-[13px] text-[#A8988C] font-light pt-2">
                <MapPin className="w-4 h-4 text-[#C5A059] flex-shrink-0 mt-0.5" />
                <span className="leading-relaxed">{address}</span>
              </div>

              <div className="flex items-center gap-3 text-[13px] text-[#A8988C] font-light">
                <Clock className="w-4 h-4 text-[#C5A059] flex-shrink-0" />
                <span>{businessHours}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-[#8C7B6E] gap-2 text-center sm:text-left">
          <p>© {new Date().getFullYear()} Mỹ Nghệ Đông Phong. Bản quyền thuộc về thương hiệu.</p>
          <p className="text-[11px]">Tuyệt tác mộc thủ công — Gỗ quý phong thủy Việt Nam</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
