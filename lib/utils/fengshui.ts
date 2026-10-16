/**
 * lib/utils/fengshui.ts
 * Thuật toán tính toán Can Chi, Ngũ Hành Nạp Âm và Gợi Ý Linh Mộc Hợp Mệnh
 * Chuẩn phong thủy học phương Đông ứng dụng cho Mỹ Nghệ Đông Phong
 */

export interface FengshuiResult {
  year: number;
  gender: "nam" | "nu";
  canChi: string;
  menhNguHanh: "Kim" | "Moc" | "Thuy" | "Hoa" | "Tho";
  napAm: string;
  napAmMeaning: string;
  tuongSinh: {
    hanh: string;
    colors: string[];
    description: string;
  };
  tuongHop: {
    hanh: string;
    colors: string[];
    description: string;
  };
  khuyenDungWoods: Array<{
    name: string;
    description: string;
    productCategory: string;
    highlight: string;
  }>;
  kiengKy: string;
  loiKhuyenNgheNhan: string;
}

const CAN = ["Canh", "Tân", "Nhâm", "Quý", "Giáp", "Ất", "Bính", "Đinh", "Mậu", "Kỷ"];
const CHI = ["Thân", "Dậu", "Tuất", "Hợi", "Tý", "Sửu", "Dần", "Mão", "Thìn", "Tỵ", "Ngọ", "Mùi"];

const NAP_AM_MAP: Record<string, { menh: "Kim" | "Moc" | "Thuy" | "Hoa" | "Tho"; name: string; meaning: string }> = {
  "Giáp Tý": { menh: "Kim", name: "Hải Trung Kim", meaning: "Vàng dưới đáy biển sâu — Tích tụ nội lực, thâm trầm, kiên định" },
  "Ất Sửu": { menh: "Kim", name: "Hải Trung Kim", meaning: "Vàng dưới đáy biển sâu — Tích tụ nội lực, thâm trầm, kiên định" },
  "Bính Dần": { menh: "Hoa", name: "Lư Trung Hỏa", meaning: "Lửa trong lò lửa thiêng — Nhiệt huyết, bộc trực, ý chí quật cường" },
  "Đinh Mão": { menh: "Hoa", name: "Lư Trung Hỏa", meaning: "Lửa trong lò lửa thiêng — Nhiệt huyết, bộc trực, ý chí quật cường" },
  "Mậu Thìn": { menh: "Moc", name: "Đại Lâm Mộc", meaning: "Cây đại thụ giữa rừng già — Tán lá che chở, kiên cường, nhân hậu" },
  "Kỷ Tỵ": { menh: "Moc", name: "Đại Lâm Mộc", meaning: "Cây đại thụ giữa rừng già — Tán lá che chở, kiên cường, nhân hậu" },
  "Canh Ngọ": { menh: "Tho", name: "Lộ Bàng Thổ", meaning: "Đất ven đường lớn — Vững chãi, phóng khoáng, giàu lòng bao dung" },
  "Tân Mùi": { menh: "Tho", name: "Lộ Bàng Thổ", meaning: "Đất ven đường lớn — Vững chãi, phóng khoáng, giàu lòng bao dung" },
  "Nhâm Thân": { menh: "Kim", name: "Kiếm Phong Kim", meaning: "Vàng mũi kiếm tôi luyện — Sắc bén, quyết đoán, tài ba xuất chúng" },
  "Quý Dậu": { menh: "Kim", name: "Kiếm Phong Kim", meaning: "Vàng mũi kiếm tôi luyện — Sắc bén, quyết đoán, tài ba xuất chúng" },
  "Giáp Tuất": { menh: "Hoa", name: "Sơn Đầu Hỏa", meaning: "Lửa trên đỉnh núi — Rực rỡ, lan tỏa hào quang, ấm áp" },
  "Ất Hợi": { menh: "Hoa", name: "Sơn Đầu Hỏa", meaning: "Lửa trên đỉnh núi — Rực rỡ, lan tỏa hào quang, ấm áp" },
  "Bính Tý": { menh: "Thuy", name: "Giản Hạ Thủy", meaning: "Nước khe suối róc rách — Uyển chuyển, thông tuệ, nội tâm sâu sắc" },
  "Đinh Sửu": { menh: "Thuy", name: "Giản Hạ Thủy", meaning: "Nước khe suối róc rách — Uyển chuyển, thông tuệ, nội tâm sâu sắc" },
  "Mậu Dần": { menh: "Tho", name: "Thành Đầu Thổ", meaning: "Đất mặt thành vững chắc — Điểm tựa ngàn đời, trung thành, vững vàng" },
  "Kỷ Mão": { menh: "Tho", name: "Thành Đầu Thổ", meaning: "Đất mặt thành vững chắc — Điểm tựa ngàn đời, trung thành, vững vàng" },
  "Canh Thìn": { menh: "Kim", name: "Bạch Lạp Kim", meaning: "Vàng trong sáp ong — Trong sáng, thanh khiết, tôi luyện thành tài" },
  "Tân Tỵ": { menh: "Kim", name: "Bạch Lạp Kim", meaning: "Vàng trong sáp ong — Trong sáng, thanh khiết, tôi luyện thành tài" },
  "Nhâm Ngọ": { menh: "Moc", name: "Dương Liễu Mộc", meaning: "Gỗ cây dương liễu — Mềm mại, thích nghi phi thường, khéo léo" },
  "Quý Mùi": { menh: "Moc", name: "Dương Liễu Mộc", meaning: "Gỗ cây dương liễu — Mềm mại, thích nghi phi thường, khéo léo" },
  "Giáp Thân": { menh: "Thuy", name: "Tuyền Trung Thủy", meaning: "Nước trong giếng sâu — Tinh khiết, vô tận, nuôi dưỡng muôn loài" },
  "Ất Dậu": { menh: "Thuy", name: "Tuyền Trung Thủy", meaning: "Nước trong giếng sâu — Tinh khiết, vô tận, nuôi dưỡng muôn loài" },
  "Bính Tuất": { menh: "Tho", name: "Ốc Thượng Thổ", meaning: "Đất trên mái ngói — Che nắng che mưa, chở che gia đạo ấm êm" },
  "Đinh Hợi": { menh: "Tho", name: "Ốc Thượng Thổ", meaning: "Đất trên mái ngói — Che nắng che mưa, chở che gia đạo ấm êm" },
  "Mậu Tý": { menh: "Hoa", name: "Tích Lịch Hỏa", meaning: "Lửa sấm sét trên trời — Sức mạnh bộc phát phi thường, chấn động bốn phương" },
  "Kỷ Sửu": { menh: "Hoa", name: "Tích Lịch Hỏa", meaning: "Lửa sấm sét trên trời — Sức mạnh bộc phát phi thường, chấn động bốn phương" },
  "Canh Dần": { menh: "Moc", name: "Tùng Bách Mộc", meaning: "Gỗ cây tùng bách ngàn năm — Bất khuất trước bão tuyết, trường thọ, uy nghiêm" },
  "Tân Mão": { menh: "Moc", name: "Tùng Bách Mộc", meaning: "Gỗ cây tùng bách ngàn năm — Bất khuất trước bão tuyết, trường thọ, uy nghiêm" },
  "Nhâm Thìn": { menh: "Thuy", name: "Trường Lưu Thủy", meaning: "Nước dòng sông lớn dài bất tận — Hướng ra biển lớn, chí hướng ngút ngàn" },
  "Quý Tỵ": { menh: "Thuy", name: "Trường Lưu Thủy", meaning: "Nước dòng sông lớn dài bất tận — Hướng ra biển lớn, chí hướng ngút ngàn" },
  "Giáp Ngọ": { menh: "Kim", name: "Sa Trung Kim", meaning: "Vàng ẩn trong cát mịn — Quý giá kín đáo, càng sàng lọc càng sáng giá" },
  "Ất Mùi": { menh: "Kim", name: "Sa Trung Kim", meaning: "Vàng ẩn trong cát mịn — Quý giá kín đáo, càng sàng lọc càng sáng giá" },
  "Bính Thân": { menh: "Hoa", name: "Sơn Hạ Hỏa", meaning: "Lửa dưới chân núi — Ấm áp đời thường, thực tế, bền bỉ" },
  "Đinh Dậu": { menh: "Hoa", name: "Sơn Hạ Hỏa", meaning: "Lửa dưới chân núi — Ấm áp đời thường, thực tế, bền bỉ" },
  "Mậu Tuất": { menh: "Moc", name: "Bình Địa Mộc", meaning: "Cây cối nơi đồng bằng — Tươi tốt phì nhiêu, sinh sôi nảy nở nhanh chóng" },
  "Kỷ Hợi": { menh: "Moc", name: "Bình Địa Mộc", meaning: "Cây cối nơi đồng bằng — Tươi tốt phì nhiêu, sinh sôi nảy nở nhanh chóng" },
  "Canh Tý": { menh: "Tho", name: "Bích Thượng Thổ", meaning: "Đất trên bờ vách — Vững chắc, ngăn gió chắn bão, an cư lạc nghiệp" },
  "Tân Sửu": { menh: "Tho", name: "Bích Thượng Thổ", meaning: "Đất trên bờ vách — Vững chắc, ngăn gió chắn bão, an cư lạc nghiệp" },
  "Nhâm Dần": { menh: "Kim", name: "Kim Bạch Kim", meaning: "Vàng bạc thỏi tinh khiết — Quý giá thượng hạng, phú quý tột bậc" },
  "Quý Mão": { menh: "Kim", name: "Kim Bạch Kim", meaning: "Vàng bạc thỏi tinh khiết — Quý giá thượng hạng, phú quý tột bậc" },
  "Giáp Thìn": { menh: "Hoa", name: "Phúc Đăng Hỏa", meaning: "Lửa ngọn đèn dầu soi đêm — Khai sáng trí tuệ, mang lại may mắn, bình an" },
  "Ất Tỵ": { menh: "Hoa", name: "Phúc Đăng Hỏa", meaning: "Lửa ngọn đèn dầu soi đêm — Khai sáng trí tuệ, mang lại may mắn, bình an" },
  "Bính Ngọ": { menh: "Thuy", name: "Thiên Hà Thủy", meaning: "Nước mưa từ trời cao — Tinh khôi vô ngần, tưới tắm hồi sinh muôn loài" },
  "Đinh Mùi": { menh: "Thuy", name: "Thiên Hà Thủy", meaning: "Nước mưa từ trời cao — Tinh khôi vô ngần, tưới tắm hồi sinh muôn loài" },
  "Mậu Thân": { menh: "Tho", name: "Đại Trạch Thổ", meaning: "Đất đầm lầy màu mỡ — Chứa đựng nguồn sống vô tận, bao la, dung nạp" },
  "Kỷ Dậu": { menh: "Tho", name: "Đại Trạch Thổ", meaning: "Đất đầm lầy màu mỡ — Chứa đựng nguồn sống vô tận, bao la, dung nạp" },
  "Canh Tuất": { menh: "Kim", name: "Thoa Xuyến Kim", meaning: "Vàng trang sức trâm cài — Tinh xảo, quý phái, tỏa sáng rực rỡ" },
  "Tân Hợi": { menh: "Kim", name: "Thoa Xuyến Kim", meaning: "Vàng trang sức trâm cài — Tinh xảo, quý phái, tỏa sáng rực rỡ" },
  "Nhâm Tý": { menh: "Moc", name: "Tang Đố Mộc", meaning: "Gỗ cây dâu tằm cổ thụ — Đệ nhất trừ tà, dẻo dai, trường tồn" },
  "Quý Sửu": { menh: "Moc", name: "Tang Đố Mộc", meaning: "Gỗ cây dâu tằm cổ thụ — Đệ nhất trừ tà, dẻo dai, trường tồn" },
  "Giáp Dần": { menh: "Thuy", name: "Đại Khê Thủy", meaning: "Nước khe suối lớn — Cuồn cuộn sinh lực, dũng mãnh, vượt mọi ghềnh thác" },
  "Ất Mão": { menh: "Thuy", name: "Đại Khê Thủy", meaning: "Nước khe suối lớn — Cuồn cuộn sinh lực, dũng mãnh, vượt mọi ghềnh thác" },
  "Bính Thìn": { menh: "Tho", name: "Sa Trung Thổ", meaning: "Đất pha cát mịn màng — Linh hoạt biến hóa, nuôi dưỡng khoáng sản quý" },
  "Đinh Tỵ": { menh: "Tho", name: "Sa Trung Thổ", meaning: "Đất pha cát mịn màng — Linh hoạt biến hóa, nuôi dưỡng khoáng sản quý" },
  "Mậu Ngọ": { menh: "Hoa", name: "Thiên Thượng Hỏa", meaning: "Lửa vầng thái dương — Nguồn sống vĩ đại của muôn loài, soi sáng vạn dặm" },
  "Kỷ Mùi": { menh: "Hoa", name: "Thiên Thượng Hỏa", meaning: "Lửa vầng thái dương — Nguồn sống vĩ đại của muôn loài, soi sáng vạn dặm" },
  "Canh Thân": { menh: "Moc", name: "Thạch Lựu Mộc", meaning: "Gỗ cây lựu mọc trên đá — Kiên cường chịu sương gió, hoa thơm trái ngọt trĩu cành" },
  "Tân Dậu": { menh: "Moc", name: "Thạch Lựu Mộc", meaning: "Gỗ cây lựu mọc trên đá — Kiên cường chịu sương gió, hoa thơm trái ngọt trĩu cành" },
  "Nhâm Tuất": { menh: "Thuy", name: "Đại Hải Thủy", meaning: "Nước biển mênh mông — Dung nạp trăm sông, bao la vô bờ, trí tuệ vô tận" },
  "Quý Hợi": { menh: "Thuy", name: "Đại Hải Thủy", meaning: "Nước biển mênh mông — Dung nạp trăm sông, bao la vô bờ, trí tuệ vô tận" }
};

export function calculateFengshui(year: number, gender: "nam" | "nu" = "nam"): FengshuiResult {
  const can = CAN[year % 10];
  const chi = CHI[year % 12];
  const canChi = `${can} ${chi}`;
  const record = NAP_AM_MAP[canChi] || {
    menh: "Kim",
    name: "Ngũ Hành Bản Mệnh",
    meaning: "Bản mệnh cát lành, sinh khí sung túc"
  };

  switch (record.menh) {
    case "Kim":
      return {
        year,
        gender,
        canChi,
        menhNguHanh: "Kim",
        napAm: record.name,
        napAmMeaning: record.meaning,
        tuongSinh: {
          hanh: "Thổ (Thổ sinh Kim)",
          colors: ["Vàng hổ phách", "Nâu đất", "Nâu socola"],
          description: "Đất mẹ bao bọc nuôi dưỡng kim loại quý, giúp nền tảng sự nghiệp vững chãi, tích lũy tài chính bền lâu."
        },
        tuongHop: {
          hanh: "Kim (Kim hòa Kim)",
          colors: ["Trắng tinh khôi", "Ánh kim sa", "Xám bạc"],
          description: "Tăng cường sự sắc bén, quyết đoán và trí tuệ minh mẫn trong mọi quyết định kinh doanh."
        },
        khuyenDungWoods: [
          {
            name: "Hoàng Đàn Tuyết Lạng Sơn",
            highlight: "Bảo vật số 1 cho Mệnh Kim",
            description: "Tâm gỗ vàng hổ phách (Thổ) kết hợp lớp tuyết tinh dầu trắng muốt (Kim). Khí sinh Tài, Tài sinh Lộc, chiêu quý nhân phù trợ.",
            productCategory: "vong-tay"
          },
          {
            name: "Gỗ Sưa Đỏ Bắc Bộ (Lên nước ánh kim)",
            highlight: "Đế vương chi mộc",
            description: "Thớ gỗ đanh chắc, vân xoắn mây ngũ sắc lên nước ánh kim lấp lánh, vượng phát công danh uy quyền.",
            productCategory: "vong-tay"
          },
          {
            name: "Bút Ký Lõi Hoàng Đàn Tuyết",
            highlight: "Khai thông tài lộc ký kết",
            description: "Đặt trên bàn làm việc giúp hút vượng khí, chữ ký hạ xuống mang lại hợp đồng suôn sẻ.",
            productCategory: "but-ky"
          }
        ],
        kiengKy: "Hạn chế sử dụng các dòng gỗ có màu đỏ rực hoặc tính hỏa quá vượng khi tâm trạng đang nóng nảy bức bối.",
        loiKhuyenNgheNhan: "Người mệnh Kim nên đeo vòng tay trái khi đi đàm phán để nạp tài khí, và đeo tay phải khi cần trừ uế khí nơi đông người."
      };

    case "Moc":
      return {
        year,
        gender,
        canChi,
        menhNguHanh: "Moc",
        napAm: record.name,
        napAmMeaning: record.meaning,
        tuongSinh: {
          hanh: "Thủy (Thủy sinh Mộc)",
          colors: ["Đen tuyền", "Xanh đen", "Xanh nước biển"],
          description: "Dòng nước mát lành tưới tắm rễ cây, giúp sinh khí dồi dào, sức khỏe trường thọ và vạn sự hanh thông."
        },
        tuongHop: {
          hanh: "Mộc (Mộc hòa Mộc)",
          colors: ["Xanh lục mộc", "Vàng nhạt tự nhiên"],
          description: "Rừng cây xanh tốt vững chãi trước bão táp, bồi dưỡng sự kiên trì và an định tâm hồn."
        },
        khuyenDungWoods: [
          {
            name: "Nu Bách Xanh Mộc Châu (Chìm Nước)",
            highlight: "Linh mộc Tây Bắc",
            description: "Vân chun chớp lấp lánh, mùi hương ngọc am ngọt mát thanh khiết, an định thần trí, xoa dịu âu lo.",
            productCategory: "vong-tay"
          },
          {
            name: "Mun Sừng Khánh Hòa",
            highlight: "Trầm tích đen bóng",
            description: "Thớ gỗ đen nhánh đanh như đá quý, chìm hoàn toàn trong nước, mang trường năng lượng Thủy nuôi dưỡng Mộc cực thịnh.",
            productCategory: "vong-tay"
          },
          {
            name: "Gối Gỗ Bách Xanh Thoáng Khí",
            highlight: "An thần ngủ sâu",
            description: "Hạt gỗ bách xanh massage đốt sống cổ, tỏa hương thơm ngọc am xua tan mệt mỏi sau ngày dài làm việc.",
            productCategory: "goi-go"
          }
        ],
        kiengKy: "Tránh các vật phẩm gỗ bị phủ sơn PU bóng lộn hóa chất làm nghẽn mao mạch thở của gỗ tự nhiên.",
        loiKhuyenNgheNhan: "Người mệnh Mộc rất hợp với chuỗi 108 hạt Bách Xanh quấn tay để nuôi dưỡng tâm từ bi, nhẫn nại và đón lộc bền bỉ."
      };

    case "Thuy":
      return {
        year,
        gender,
        canChi,
        menhNguHanh: "Thuy",
        napAm: record.name,
        napAmMeaning: record.meaning,
        tuongSinh: {
          hanh: "Kim (Kim sinh Thủy)",
          colors: ["Trắng tuyết", "Ánh bạc", "Vàng sáng"],
          description: "Kim loại nung chảy sinh nguồn nước mát, kích hoạt nguồn tài lộc dồi dào và mở mang trí tuệ."
        },
        tuongHop: {
          hanh: "Thủy (Thủy hòa Thủy)",
          colors: ["Đen huyền bí", "Xanh lam đậm"],
          description: "Trăm sông đổ về một biển lớn, dung nạp vạn vật, củng cố sự uyển chuyển và linh hoạt thương trường."
        },
        khuyenDungWoods: [
          {
            name: "Trầm Hương Tự Nhiên Rục Chìm",
            highlight: "Vua của các mùi hương",
            description: "Mùi hương cõi Niết Bàn thanh tẩy uế khí, an định tinh thần sâu lắng, chiêu tài đón lộc bậc nhất.",
            productCategory: "vong-tay"
          },
          {
            name: "Gỗ Mun Sừng Khánh Hòa",
            highlight: "Hắc mộc phong thủy",
            description: "Bề mặt nhẵn bóng như gương, tính hàn ôn hòa, ngăn chặn tiểu nhân gièm pha và giữ vững tài sản.",
            productCategory: "vong-tay"
          },
          {
            name: "Bi Lăn Tay Gỗ Cẩm Lai Dưỡng Sinh",
            highlight: "Lưu thông khí huyết",
            description: "Kích hoạt các huyệt đạo lòng bàn tay, điều hòa nhịp thở và giúp người mệnh Thủy giải tỏa căng thẳng.",
            productCategory: "bi-lan-tay"
          }
        ],
        kiengKy: "Hạn chế đeo các dòng gỗ đất khô cằn hoặc phôi gỗ non xốp dễ thấm bẩn.",
        loiKhuyenNgheNhan: "Nước cần chảy để không bị tù đọng. Người mệnh Thủy hãy xoa vòng tay hàng ngày để tinh dầu gỗ tiếp xúc thân nhiệt phát huy tối đa linh lực."
      };

    case "Hoa":
      return {
        year,
        gender,
        canChi,
        menhNguHanh: "Hoa",
        napAm: record.name,
        napAmMeaning: record.meaning,
        tuongSinh: {
          hanh: "Mộc (Mộc sinh Hỏa)",
          colors: ["Xanh lục mộc", "Vàng mật ong"],
          description: "Cây cối tiếp thêm nhiên liệu cho ngọn lửa bùng cháy rực rỡ, mang lại sinh lực dồi dào và cơ hội thăng tiến."
        },
        tuongHop: {
          hanh: "Hỏa (Hỏa hòa Hỏa)",
          colors: ["Đỏ cánh gián", "Tím thẫm", "Cam hổ phách"],
          description: "Tăng cường năng lượng dương quang minh, sự nhiệt huyết và khả năng lãnh đạo quần chúng."
        },
        khuyenDungWoods: [
          {
            name: "Tử Đàn Tiểu Diệp Ấn Độ (Kim Sa)",
            highlight: "Vương mộc Phật gia",
            description: "Chất gỗ đỏ thẫm ánh sao kim, đanh như thép, thả chìm nước, xua đuổi tà khí và mang lại vượng khí cực đỉnh.",
            productCategory: "vong-tay"
          },
          {
            name: "Gỗ Huyết Long Thấu Quang",
            highlight: "Lửa thiêng ánh rồng",
            description: "Rọi đèn flash phát quang đỏ rực như ngọn lửa thiêng, xua tan âm khí, giải trừ vận hạn tam tai.",
            productCategory: "vong-tay"
          },
          {
            name: "Bút Ký Nu Huyết Long Phong Thủy",
            highlight: "Uy quyền lãnh đạo",
            description: "Vân nu xoắn độc bản phát quang rực rỡ, chiêu tài đắc lộc cho các doanh nhân mệnh Hỏa.",
            productCategory: "but-ky"
          }
        ],
        kiengKy: "Người mệnh Hỏa khi thấy nóng trong người hoặc dễ cáu gắt nên kết hợp xông trầm hoặc lau vòng bằng khăn ẩm dịu mát.",
        loiKhuyenNgheNhan: "Người mệnh Hỏa đeo Tử Đàn Tiểu Diệp càng lâu, vòng càng lên nước màu mỡ gà bóng lộn, phúc lộc đời đời bền vững."
      };

    case "Tho":
      return {
        year,
        gender,
        canChi,
        menhNguHanh: "Tho",
        napAm: record.name,
        napAmMeaning: record.meaning,
        tuongSinh: {
          hanh: "Hỏa (Hỏa sinh Thổ)",
          colors: ["Đỏ ruby", "Tím đậm", "Cam đất"],
          description: "Lửa thiêng thiêu đốt vạn vật tạo thành tro bụi màu mỡ bồi đắp đất mẹ, mang lại sự sinh sôi của cải dồi dào."
        },
        tuongHop: {
          hanh: "Thổ (Thổ hòa Thổ)",
          colors: ["Nâu đất", "Nâu socola", "Vàng sậm"],
          description: "Đất đai trùng điệp vững như thành trì, củng cố gia đạo ấm êm và sự nghiệp thăng tiến vững chắc."
        },
        khuyenDungWoods: [
          {
            name: "Gỗ Trắc Đỏ Đen Tự Nhiên",
            highlight: "Thần mộc bền bỉ",
            description: "Thớ gỗ đanh nặng như đá, vân đen chỉ đỏ quyện lẫn, tượng trưng cho nền móng cơ nghiệp vững chãi ngàn năm.",
            productCategory: "vong-tay"
          },
          {
            name: "Tử Đàn Tiểu Diệp Đỏ Thẫm",
            highlight: "Hỏa sinh Thổ vượng tài",
            description: "Năng lượng Hỏa ấm áp từ Tử Đàn nuôi dưỡng bản mệnh Thổ, chiêu tài đón lộc và gặp nhiều may mắn.",
            productCategory: "vong-tay"
          },
          {
            name: "Đệm Ghế Ô Tô Hạt Gỗ Trắc",
            highlight: "Thoáng lưng hộ mệnh dặm dài",
            description: "Hạt gỗ trắc tự nhiên đầm chắc, chống mỏi lưng, xua đuổi ám khí trên xe, mang lại bình an vạn dặm.",
            productCategory: "dem-o-to"
          }
        ],
        kiengKy: "Hạn chế dùng các loại gỗ ẩm mốc hoặc để vòng bám bụi bẩn lâu ngày không vệ sinh.",
        loiKhuyenNgheNhan: "Người mệnh Thổ nên chọn các chuỗi hạt kích thước lớn (14mm - 16mm) để tăng thêm phần vững chãi, uy phong."
      };
  }
}
