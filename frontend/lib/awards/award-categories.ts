/**
 * SAA 2025 award catalogue — mm:313:8466 (D.Danh sách giải thưởng).
 *
 * Content is transcribed verbatim from the MoMorph/Figma screen
 * `zFYDgyj_pD` ("Hệ thống giải") via the text-override values returned by
 * `get_node_context`, cross-checked against the frame's spec rows (D.1–D.6).
 * Nothing here is invented or paraphrased.
 *
 * It deliberately lives in a data module rather than in `messages/*.json`:
 * the design ships this copy in Vietnamese only, and there is no approved
 * English rendering of the award descriptions. Translating marketing copy
 * would be fabricating content. The surrounding UI chrome (labels, buttons)
 * IS localised — see the `awards` namespace in the message catalogues.
 */

/** A single "Giá trị giải thưởng" row. Signature 2025 carries two. */
export type AwardPrize = {
  /** mm:…;214:2546 — e.g. "7.000.000 VNĐ" */
  value: string;
  /** mm:…;214:2547 — e.g. "cho mỗi giải thưởng". Absent on some cards. */
  note?: string;
};

export type AwardCategory = {
  /** Anchor id; also the left-nav target. */
  id: string;
  /** mm:313:8460–313:8465 — short label in the left-hand category menu. */
  navLabel: string;
  /** mm:…;214:2530 — heading inside the card. */
  title: string;
  /** mm:…;214:2531 — body paragraph. */
  description: string;
  /** mm:…;214:2538 — "10", "02", … Rendered at display size. */
  quantity: string;
  /** mm:…;214:3532 — "Cá nhân", "Tập thể", … */
  quantityUnit: string;
  prizes: AwardPrize[];
  /**
   * `/public/awards/award-name-*.png` overlay when Figma exports one.
   * Only Top Talent has an exportable `mm_media_Award-Name-*` asset; the
   * other five are reproduced as gold gradient type. See AwardThumbnail.
   */
  nameImage?: string;
};

export const AWARD_CATEGORIES: AwardCategory[] = [
  {
    // mm:313:8467 (mms_D.1_Top talent)
    id: "top-talent",
    navLabel: "Top Talent",
    title: "Top Talent",
    description:
      "Giải thưởng Top Talent vinh danh những cá nhân xuất sắc toàn diện – những người không ngừng khẳng định năng lực chuyên môn vững vàng, hiệu suất công việc vượt trội, luôn mang lại giá trị vượt kỳ vọng, được đánh giá cao bởi khách hàng và đồng đội. Với tinh thần sẵn sàng nhận mọi nhiệm vụ tổ chức giao phó, họ luôn là nguồn cảm hứng, thúc đẩy động lực và tạo ảnh hưởng tích cực đến cả tập thể.",
    quantity: "10",
    quantityUnit: "Cá nhân",
    prizes: [{ value: "7.000.000 VNĐ", note: "cho mỗi giải thưởng" }],
    nameImage: "/awards/award-name-top-talent.png",
  },
  {
    // mm:313:8468 (mms_D.2_Top Project)
    id: "top-project",
    navLabel: "Top Project",
    title: "Top Project",
    description:
      "Giải thưởng Top Project vinh danh các tập thể dự án xuất sắc với kết quả kinh doanh vượt kỳ vọng, hiệu quả vận hành tối ưu và tinh thần làm việc tận tâm. Đây là các dự án có độ phức tạp kỹ thuật cao, hiệu quả tối ưu hóa nguồn lực và chi phí tốt, đề xuất các ý tưởng có giá trị cho khách hàng, đem lại lợi nhuận vượt trội và nhận được phản hồi tích cực từ khách hàng. Các thành viên tuân thủ nghiêm ngặt các tiêu chuẩn phát triển nội bộ trong phát triển dự án, tạo nên một hình mẫu về sự xuất sắc và chuyên nghiệp.",
    quantity: "02",
    quantityUnit: "Tập thể",
    prizes: [{ value: "15.000.000 VNĐ", note: "cho mỗi giải thưởng" }],
  },
  {
    // mm:313:8469 (mms_D.3_Top Project Leader)
    id: "top-project-leader",
    navLabel: "Top Project Leader",
    title: "Top Project Leader",
    description:
      "Giải thưởng Top Project Leader vinh danh những nhà quản lý dự án xuất sắc – những người hội tụ năng lực quản lý vững vàng, khả năng truyền cảm hứng mạnh mẽ, và tư duy “Aim High – Be Agile” trong mọi bài toán và bối cảnh. Dưới sự dẫn dắt của họ, các thành viên không chỉ cùng nhau vượt qua thử thách và đạt được mục tiêu đề ra, mà còn giữ vững ngọn lửa nhiệt huyết, tinh thần Wasshoi, và trưởng thành để trở thành phiên bản tinh hoa – hạnh phúc hơn của chính mình.",
    quantity: "03",
    quantityUnit: "Cá nhân",
    prizes: [{ value: "7.000.000 VNĐ", note: "cho mỗi giải thưởng" }],
  },
  {
    // mm:313:8470 (mms_D.4_Thông tin giải — Best Manager)
    id: "best-manager",
    navLabel: "Best Manager",
    title: "Best Manager",
    description:
      "Giải thưởng Best Manager vinh danh những nhà lãnh đạo tiêu biểu – người đã dẫn dắt đội ngũ của mình tạo ra kết quả vượt kỳ vọng, tác động nổi bật đến hiệu quả kinh doanh và sự phát triển bền vững của tổ chức. Dưới sự lãnh đạo của họ, đội ngũ luôn chinh phục và làm chủ mọi mục tiêu bằng năng lực đa nhiệm, khả năng phối hợp hiệu quả, và tư duy ứng dụng công nghệ linh hoạt trong kỷ nguyên số. Họ truyền cảm hứng để tập thể trở nên tự tin tràn đầy năng lượng, sẵn sàng đón nhận, thậm chí dẫn dắt tạo ra những thay đổi có tính cách mạng.",
    quantity: "01",
    quantityUnit: "Cá nhân",
    prizes: [{ value: "10.000.000 VNĐ" }],
  },
  {
    // mm:313:8471 (mms_D.5_Signature 2025) — the only card with two prizes
    id: "signature-2025-creator",
    navLabel: "Signature 2025 Creator",
    title: "Signature 2025 - Creator",
    description:
      "Giải thưởng Signature vinh danh cá nhân hoặc tập thể thể hiện tinh thần đặc trưng mà Sun* hướng tới trong từng thời kỳ.\n\nTrong năm 2025, giải thưởng Signature vinh danh Creator - cá nhân/tập thể mang tư duy chủ động và nhạy bén, luôn nhìn thấy cơ hội trong thách thức và tiên phong trong hành động. Họ là những người nhạy bén với vấn đề, nhanh chóng nhận diện và đưa ra những giải pháp thực tiễn, mang lại giá trị rõ rệt cho dự án, khách hàng hoặc tổ chức. Với tư duy kiến tạo và tinh thần “Creator” đặc trưng của Sun*, họ không chỉ phản ứng tích cực trước sự thay đổi mà còn chủ động tạo ra cải tiến, góp phần định hình chuẩn mực mới cho cách mà người Sun* tạo giá trị.",
    quantity: "01",
    quantityUnit: "Cá nhân hoặc tập thể",
    prizes: [
      { value: "5.000.000 VNĐ", note: "cho giải cá nhân" },
      { value: "8.000.000 VNĐ", note: "cho giải tập thể" },
    ],
  },
  {
    // mm:313:8510 (mms_D.6_MVP)
    id: "mvp",
    navLabel: "MVP",
    title: "MVP (Most Valuable Person)",
    description:
      "Giải thưởng MVP vinh danh cá nhân xuất sắc nhất năm – gương mặt tiêu biểu đại diện cho toàn bộ tập thể Sun*. Họ là người đã thể hiện năng lực vượt trội, tinh thần cống hiến bền bỉ, và tầm ảnh hưởng sâu rộng, để lại dấu ấn mạnh mẽ trong hành trình của Sun* suốt năm qua.\n\nKhông chỉ nổi bật bởi hiệu suất và kết quả công việc, họ còn là nguồn cảm hứng lan tỏa – thông qua suy nghĩ, hành động và ảnh hưởng tích cực của mình đối với tập thể. MVP là người hội tụ đầy đủ phẩm chất của người Sun* ưu tú, đồng thời mang trên mình trọng trách lớn lao: trở thành hình mẫu đại diện cho con người và tinh thần Sun*, góp phần dẫn dắt tập thể vươn tới những đỉnh cao mới.",
    quantity: "01",
    quantityUnit: "Cá nhân",
    prizes: [{ value: "15.000.000 VNĐ" }],
  },
];

/**
 * Sun* Kudos promo block — mm:335:12023 (mms_D1_Sunkudos).
 * Same provenance and same reason for living outside the catalogues.
 */
export const KUDOS_BODY =
  "ĐIỂM MỚI CỦA SAA 2025\nHoạt động ghi nhận và cảm ơn đồng nghiệp - lần đầu tiên được diễn ra dành cho tất cả Sunner. Hoạt động sẽ được triển khai vào tháng 11/2025, khuyến khích người Sun* chia sẻ những lời ghi nhận, cảm ơn đồng nghiệp trên hệ thống do BTC công bố. Đây sẽ là chất liệu để Hội đồng Heads tham khảo trong quá trình lựa chọn người đạt giải.";
