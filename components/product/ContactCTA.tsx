"use client";

import React from "react";
import { MessageCircle, Phone, ShieldCheck, Truck } from "lucide-react";
import { createZaloLink } from "@/lib/formatPrice";
import settingsData from "@/data/settings.json";
import { useSettingsStore } from "@/lib/useSettings";

export interface ContactCTAProps {
  productCode: string;
  productName: string;
  selectedSize?: string;
}

export function ContactCTA({
  productCode,
  productName,
  selectedSize,
}: ContactCTAProps) {
  const { settings, loadSettings } = useSettingsStore();

  React.useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const rawPhone = settings?.brand?.phone || settings?.hotline || settingsData.brand.phone;
  const rawZalo = settings?.brand?.zaloLink || settings?.zaloLink || settingsData.brand.zaloLink;

  const fullDetail = selectedSize ? `${productName} (Size: ${selectedSize})` : productName;
  const zaloUrl = createZaloLink(rawZalo, productCode, fullDetail);
  const cleanPhone = rawPhone.replace(/\s+/g, "");

  return (
    <div className="space-y-4 pt-4 border-t border-border select-none">
      {/* Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <a
          href={zaloUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2.5 bg-primary hover:bg-primary-hover text-white font-bold py-3.5 px-6 rounded-btn shadow-md hover:shadow-lg transition-all active:scale-[0.98] text-sm"
        >
          <MessageCircle className="w-5 h-5" />
          <span>Nhắn Zalo Thỉnh Tác Phẩm</span>
        </a>

        <a
          href={`tel:${cleanPhone}`}
          className="flex items-center justify-center gap-2.5 bg-[#8E4424] hover:bg-[#78361B] text-white font-semibold py-3.5 px-6 rounded-btn shadow-md hover:shadow-lg transition-all active:scale-[0.98] text-sm"
        >
          <Phone className="w-5 h-5" />
          <span>Gọi Hotline {rawPhone}</span>
        </a>
      </div>

      {/* Trust reassurance icons */}
      <div className="grid grid-cols-2 gap-2 pt-2 text-[11px] text-text-muted">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-secondary flex-shrink-0" />
          <span>Kiểm tra mộc & vân gỗ trước khi nhận</span>
        </div>
        <div className="flex items-center gap-2">
          <Truck className="w-4 h-4 text-secondary flex-shrink-0" />
          <span>Giao nhanh toàn quốc, đóng hộp cao cấp</span>
        </div>
      </div>
    </div>
  );
}

export default ContactCTA;
