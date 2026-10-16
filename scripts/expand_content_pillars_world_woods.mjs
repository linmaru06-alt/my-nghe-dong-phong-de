import fs from "fs";
import path from "path";

const PILLARS_FILE = path.join(process.cwd(), "data", "content-pillars.json");
const data = JSON.parse(fs.readFileSync(PILLARS_FILE, "utf-8"));

const kienThucPillar = data.matrix.find(m => m.category === "kien-thuc-ve-go");

if (!kienThucPillar) {
  console.error("Không tìm thấy pillar kien-thuc-ve-go");
  process.exit(1);
}

// Danh sách chủ đề Kiến Thức Danh Mộc Toàn Cầu & Chuyên Sâu
const worldWoodTopics = [
  // Nhóm 1: Bách Khoa Toàn Thư Danh Mộc Quý Hiếm Nhất Thế Giới
  {
    level: "Chuyên sâu",
    title: "Top 10 Loài Gỗ Đắt Nhất Hành Tinh: Sự Thật Vì Sao Có Giá Hàng Trăm Triệu Một Kilogram?",
    researchKeywords: [
      "những loài gỗ đắt nhất thế giới",
      "gỗ quý hiếm nhất hành tinh",
      "bảng xếp hạng gỗ quý thế giới",
      "african blackwood sandalwood"
    ]
  },
  {
    level: "Chuyên sâu",
    title: "Gỗ Mun Đen Châu Phi (African Blackwood) Là Gì? Sự Thật Về Loài Gỗ Đắt Hơn Cả Vàng Ròng",
    researchKeywords: [
      "african blackwood",
      "gỗ mun đen châu phi dalbergia melanoxylon",
      "gỗ mpingo đắt nhất thế giới",
      "giá gỗ african blackwood"
    ]
  },
  {
    level: "Chuyên sâu",
    title: "Gỗ Đàn Hương Trắng Ấn Độ (Sandalwood) Có Tác Dụng Gì? Vì Sao Được Gọi Là Thánh Mộc Phương Đông?",
    researchKeywords: [
      "gỗ đàn hương trắng ấn độ santalum album",
      "tác dụng gỗ đàn hương phong thủy",
      "sandalwood tự nhiên",
      "mùi hương gỗ đàn hương"
    ]
  },
  {
    level: "Chuyên sâu",
    title: "Gỗ Cổ Đại Đầm Lầy (Bog Oak) 5.000 Năm Tuổi Có Tác Dụng Gì? Bí Mật Hóa Thạch Dưới Bùn Lầy Châu Âu",
    researchKeywords: [
      "gỗ bog oak là gì",
      "gỗ sồi đầm lầy châu âu",
      "bog oak 5000 năm tuổi",
      "gỗ ngâm bùn hóa thạch"
    ]
  },
  {
    level: "Chuyên sâu",
    title: "Gỗ Thiết Mộc Lignum Vitae: Có Thật Là Loài Gỗ Nặng Và Cứng Nhất Thế Giới Đạn Bắn Không Thủng?",
    researchKeywords: [
      "gỗ lignum vitae guaiacum officinale",
      "gỗ nặng nhất thế giới chìm nước",
      "gỗ cứng nhất hành tinh",
      "độ cứng janka lignum vitae"
    ]
  },
  {
    level: "Chuyên sâu",
    title: "Gỗ Da Rắn (Snakewood) Nam Mỹ Có Gì Đặc Biệt? Vì Sao Giới Quý Tộc Săn Lùng Điên Đảo?",
    researchKeywords: [
      "gỗ snakewood brosimum guianense",
      "gỗ da rắn nam mỹ",
      "gỗ da trăn đắt đỏ",
      "vân gỗ da rắn tự nhiên"
    ]
  },
  {
    level: "Chuyên sâu",
    title: "Gỗ Cẩm Lai Brazil (Brazilian Rosewood): Sự Thật Vì Sao Bị Cấm Khai Thác Tuyệt Đối Toàn Cầu?",
    researchKeywords: [
      "brazilian rosewood dalbergia nigra",
      "cẩm lai brazil cấm khai thác",
      "gỗ làm đàn guitar đắt nhất",
      "cites phụ lục 1 dalbergia nigra"
    ]
  },
  {
    level: "Chuyên sâu",
    title: "Bách Nhật Bản (Gỗ Hinoki) Có Tác Dụng Gì? Bí Mật Năng Lượng Thanh Tẩy Trong Đền Thần Đạo Shinto",
    researchKeywords: [
      "gỗ hinoki nhật bản chamaecyparis obtusa",
      "tác dụng gỗ hinoki phong thủy",
      "tinh dầu bách nhật bản",
      "gỗ đền thờ shinto"
    ]
  },
  {
    level: "Chuyên sâu",
    title: "Gỗ Teak (Giá Tỵ) Rừng Già Miến Điện: Vì Sao Trăm Năm Trên Biển Ngập Mặn Không Hề Mục Nát?",
    researchKeywords: [
      "gỗ teak miến điện tectona grandis",
      "gỗ giá tỵ cổ thụ làm du thuyền",
      "khả năng chịu nước của gỗ teak",
      "teak burmese tự nhiên"
    ]
  },
  {
    level: "Chuyên sâu",
    title: "Gỗ Hóa Thạch Triệu Năm (Petrified Wood) Có Tác Dụng Gì? Hành Trình Từ Cây Rừng Thành Ngọc Quý",
    researchKeywords: [
      "gỗ hóa thạch phong thủy petrified wood",
      "tác dụng năng lượng gỗ hóa thạch",
      "gỗ hóa ngọc triệu năm",
      "phân biệt gỗ hóa thạch thật giả"
    ]
  },
  {
    level: "Chuyên sâu",
    title: "Tuyết Tùng Lebanon (Lebanon Cedar): Sự Thật Về Loài Gỗ Thiêng Xây Đền Thờ Vua Solomon Trong Kinh Thánh",
    researchKeywords: [
      "tuyết tùng lebanon cedrus libani",
      "gỗ thiêng đền vua solomon",
      "gỗ tuyết tùng cổ đại",
      "ý nghĩa tâm linh gỗ tuyết tùng"
    ]
  },
  {
    level: "Chuyên sâu",
    title: "Gỗ Bocote Mắt Hổ Mexico & Cocobolo Trung Mỹ: Kiệt Tác Vân Ảo Giác Kỳ Lạ Nhất Thế Giới",
    researchKeywords: [
      "gỗ bocote cordia elaeagnoides",
      "gỗ cocobolo dalbergia retusa",
      "vân gỗ mắt hổ ảo giác",
      "gỗ đổi màu trung mỹ"
    ]
  },
  {
    level: "Chuyên sâu",
    title: "Gỗ Mun Sọc Makassar Indonesia vs Mun Sừng Khánh Hòa: Loài Nào Đắt Giá & Hiếm Hơn?",
    researchKeywords: [
      "mun sọc makassar diospyros celebica",
      "so sánh mun makassar và mun sừng",
      "mun đen indonesia vs việt nam",
      "giá trị gỗ mun thế giới"
    ]
  },
  {
    level: "Chuyên sâu",
    title: "Gỗ Nhẹ Nhất Thế Giới Balsa vs Gỗ Nặng Nhất Thế Giới Lignum Vitae: Nghịch Lý Kỳ Thú Của Tự Nhiên",
    researchKeywords: [
      "gỗ balsa ochroma pyramidale",
      "gỗ nhẹ nhất thế giới",
      "so sánh tỷ trọng gỗ tự nhiên",
      "gỗ chìm nước và gỗ nổi"
    ]
  },
  {
    level: "Chuyên sâu",
    title: "Gỗ Wenge Châu Phi (Lông Vũ Partridge Wood): Nét Đẹp Đen Nhánh Độc Bản Của Rừng Nhiệt Đới",
    researchKeywords: [
      "gỗ wenge millettia laurentii",
      "đặc tính gỗ wenge châu phi",
      "vân gỗ lông chim partridge wood",
      "độ bền gỗ wenge"
    ]
  },

  // Nhóm 2: Nhận Diện, Kỹ Thuật & Thẩm Định Danh Mộc
  {
    level: "Dễ",
    title: "Làm Sao Nhận Biết Vòng Gỗ Thật Và Gỗ Giả Ngâm Hóa Chất? 4 Thí Nghiệm Đơn Giản Tại Nhà",
    researchKeywords: [
      "cách phân biệt vòng gỗ thật giả",
      "nhận biết gỗ tẩm hóa chất tạo mùi",
      "thí nghiệm phân biệt gỗ quý",
      "gỗ thật ngâm nước nóng"
    ]
  },
  {
    level: "Dễ",
    title: "Đeo Vòng Phong Thủy Bao Nhiêu Hạt Là Tốt Nhất? Bí Mật Đếm Hạt Sinh - Lão - Bệnh - Tử",
    researchKeywords: [
      "ý nghĩa số hạt vòng tay phong thủy",
      "quy tắc sinh lão bệnh tử số hạt",
      "vòng 13 17 21 25 hạt",
      "chuỗi 108 hạt phật giáo"
    ]
  },
  {
    level: "Dễ",
    title: "Vì Sao Vòng Gỗ Càng Đeo Càng Bóng Đẹp? Giải Mã Cơ Chế Lên Nước (Patina) Tự Nhiên",
    researchKeywords: [
      "hạt gỗ lên nước sậm màu bóng đẹp",
      "cơ chế patina gỗ tự nhiên",
      "gỗ tự nhiên đổi màu khi đeo lâu",
      "mồ hôi tay làm bóng vòng gỗ"
    ]
  },
  {
    level: "Dễ",
    title: "Những Loài Gỗ Nào Từng Được Coi Là 'Bảo Vật Tiến Vua'? Lịch Sử Tử Đàn, Sưa Đỏ & Hoàng Đàn",
    researchKeywords: [
      "lịch sử gỗ tử đàn sưa đỏ tiến vua",
      "nguồn gốc danh mộc hoàng gia",
      "gỗ phong kiến triều nguyễn",
      "tử đàn cấm thành bắc kinh"
    ]
  },
  {
    level: "Dễ",
    title: "Cách Phân Biệt Gỗ Tự Nhiên Thật Với Gỗ Ép Công Nghiệp Bằng Mắt Thường Và Tiếng Va Chạm",
    researchKeywords: [
      "phân biệt gỗ tự nhiên và gỗ ép công nghiệp",
      "cách soi vân gỗ thật",
      "tiếng gõ gỗ tự nhiên đanh chắc",
      "trọng lượng gỗ thật và giả"
    ]
  },
  {
    level: "Trung bình",
    title: "Một Chiếc Vòng Gỗ Quý Được Chế Tác Ra Sao? Quy Trình Tiện Hạt & Đánh Bóng Mộc Thủ Công",
    researchKeywords: [
      "quy trình tiện hạt vòng gỗ thủ công",
      "kỹ thuật đánh bóng mộc gỗ quý",
      "tiện hạt mộc không sơn pu",
      "bí quyết thợ mộc tiện hạt tròn đều"
    ]
  },
  {
    level: "Trung bình",
    title: "Làm Thế Nào Nhận Biết Gỗ Già Trăm Năm Hay Gỗ Non? Bí Quyết Soi Tôm & Cân Tỷ Trọng",
    researchKeywords: [
      "nhận biết tuổi gỗ qua thớ và vân",
      "mật độ tinh dầu trong gỗ bách xanh tử đàn",
      "soi tôm gỗ mịn",
      "gỗ già chìm nước"
    ]
  },
  {
    level: "Trung bình",
    title: "Trầm Hương, Tử Đàn Tiểu Diệp Và Sưa Đỏ: Đâu Là Dòng Danh Mộc Đẳng Cấp Nhất?",
    researchKeywords: [
      "so sánh trầm hương và tử đàn",
      "phân biệt sưa đỏ và tử đàn ấn độ",
      "trầm hương kỳ nam tử đàn sưa đỏ",
      "loại gỗ phong thủy đắt nhất"
    ]
  },
  {
    level: "Khó",
    title: "Tiêu Chuẩn Tuyển Chọn Phôi Gỗ Già Tại Xưởng Mộc Đông Phong: Vì Sao Cấm Tuyệt Đối Dác Gỗ?",
    researchKeywords: [
      "tiêu chuẩn tuyển chọn gỗ quý xưởng mộc",
      "chọn phôi gỗ đặc không rác",
      "tâm gỗ heartwood vs dác gỗ sapwood",
      "quy trình chọn mộc đông phong"
    ]
  }
];

kienThucPillar.topics = worldWoodTopics;

fs.writeFileSync(PILLARS_FILE, JSON.stringify(data, null, 2), "utf-8");
console.log(`✅ Đã cập nhật thành công ${worldWoodTopics.length} chủ đề Bách Khoa Danh Mộc Toàn Cầu vào content-pillars.json!`);
