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
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-[#3D2314]">
          {/* Col 1: Brand & Craft Philosophy (5 cols) */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <img
                src="/images/logo.png"
                alt="Mỹ Nghệ Đông Phong"
                className="w-14 h-14 object-contain drop-shadow"
              />
              <div>
                <span className="font-serif text-2xl font-bold text-white block tracking-tight">
                  Mỹ Nghệ Đông Phong
                </span>
                <span className="text-xs text-[#C5A059] tracking-[0.18em] uppercase font-semibold">
                  Tinh hoa từ những thớ gỗ quý
                </span>
              </div>
            </div>
            <p className="text-sm text-[#A8988C] leading-relaxed max-w-sm">
              Chế tác mộc thủ công truyền thống từ các loại gỗ quý tự nhiên: Tử Đàn Ấn Độ, Sưa Đỏ, Nu Bách Xanh, Mun Sừng. Mỗi tác phẩm là một câu chuyện độc bản về thời gian và tâm huyết người thợ làng nghề.
            </p>
            <div className="flex items-center gap-4 pt-2 text-xs text-[#C5A059]">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" /> Cam kết gỗ thật 100%
              </span>
              <span className="flex items-center gap-1.5">
                <HeartHandshake className="w-4 h-4" /> Bảo hành trọn đời thớ gỗ
              </span>
            </div>

            {/* Social & Official Channels */}
            <div className="pt-3 border-t border-[#3D2314]">
              <span className="text-xs text-[#A8988C] block mb-2 font-medium">
                Gian hàng & Kênh chính thức:
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <a
                  href={shopeeLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#EE4D2D]/15 hover:bg-[#EE4D2D] text-[#FF7A59] hover:text-white border border-[#EE4D2D]/40 text-xs font-semibold transition-all duration-200 group"
                  title="Gian hàng Shopee chính hãng Mỹ Nghệ Đông Phong"
                >
                  <ShoppingBag className="w-3.5 h-3.5 text-[#EE4D2D] group-hover:text-white transition-colors" />
                  <span>Shopee</span>
                </a>

                <a
                  href={facebookLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1877F2]/15 hover:bg-[#1877F2] text-[#6CA9FF] hover:text-white border border-[#1877F2]/40 text-xs font-semibold transition-all duration-200 group"
                  title="Trang Facebook cá nhân / Fanpage"
                >
                  <Facebook className="w-3.5 h-3.5 text-[#1877F2] group-hover:text-white transition-colors" />
                  <span>Facebook</span>
                </a>

                <a
                  href={zaloLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zalo/15 hover:bg-zalo text-[#62A8FF] hover:text-white border border-zalo/40 text-xs font-semibold transition-all duration-200 group"
                  title="Nhắn Zalo tư vấn nghệ nhân"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-zalo group-hover:text-white transition-colors" />
                  <span>Zalo</span>
                </a>
              </div>
            </div>
          </div>

          {/* Col 2: Quick Links (3 cols) */}
          <div className="md:col-span-3 space-y-3">
            <h3 className="font-serif text-base font-bold text-white tracking-wide">
              Danh Mục & Liên Kết
            </h3>
            <ul className="space-y-2 text-sm text-[#A8988C]">
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
                <Link href="/lien-he" className="hover:text-white transition-colors">
                  Liên hệ & Đặt hàng theo yêu cầu
                </Link>
              </li>
              <li>
                <Link href="/lien-he#chinh-sach" className="hover:text-white transition-colors">
                  Chính sách giao nhận & bảo hành
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Direct Contact (4 cols) */}
          <div className="md:col-span-4 space-y-3">
            <h3 className="font-serif text-base font-bold text-white tracking-wide">
              Tư Vấn Trực Tiếp
            </h3>
            <p className="text-xs text-[#A8988C]">
              Quý khách có nhu cầu thỉnh tác phẩm hoặc kiểm tra vân gỗ theo thời giá, vui lòng liên hệ trực tiếp:
            </p>
            <div className="space-y-2.5 text-sm">
              <a
                href={`tel:${phone.replace(/\s+/g, "")}`}
                className="flex items-center gap-3 text-white hover:text-[#C5A059] transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-[#3D2314] flex items-center justify-center text-[#C5A059] flex-shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold font-mono text-base">{phone}</span>
                </div>
              </a>

              <div className="flex items-center gap-3 pt-2 pb-1">
                <a
                  href={zaloLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-zalo/20 flex items-center justify-center text-zalo hover:bg-zalo hover:text-white transition-all duration-300"
                  title="Zalo"
                >
                  <MessageCircle className="w-5 h-5 fill-current" />
                </a>

                <a
                  href={shopeeLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-[#EE4D2D]/20 flex items-center justify-center text-[#EE4D2D] hover:bg-[#EE4D2D] hover:text-white transition-all duration-300"
                  title="Shopee"
                >
                  <ShoppingBag className="w-5 h-5" />
                </a>

                <a
                  href={facebookLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-[#1877F2]/20 flex items-center justify-center text-[#1877F2] hover:bg-[#1877F2] hover:text-white transition-all duration-300"
                  title="Facebook"
                >
                  <Facebook className="w-5 h-5" />
                </a>
              </div>

              <div className="flex items-start gap-3 text-xs text-[#A8988C] pt-1">
                <MapPin className="w-4 h-4 text-[#C5A059] flex-shrink-0 mt-0.5" />
                <span>{address}</span>
              </div>

              <div className="flex items-center gap-3 text-xs text-[#A8988C]">
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
