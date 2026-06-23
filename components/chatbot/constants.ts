export const chatbotLayout = {
  sidebarWidth: "lg:grid-cols-[18rem_minmax(0,1fr)]",
  contentWidth: "max-w-3xl",
  radius: {
    panel: "rounded-2xl",
    control: "rounded-xl",
    message: "rounded-2xl"
  },
  surface: {
    app: "bg-[#f7f5f0] text-neutral-950",
    panel: "border border-black/10 bg-white/88 shadow-sm shadow-black/[0.03] backdrop-blur",
    sidebar: "border-r border-black/10 bg-[#fbfaf7]",
    muted: "bg-[#f0eee8]",
    userMessage: "bg-[#1d1c19] text-white shadow-sm shadow-black/10",
    assistantMessage: "text-neutral-900",
    composer: "border border-black/10 bg-white shadow-lg shadow-black/[0.06]"
  },
  focus: "focus:outline-none focus:ring-2 focus:ring-[#1d1c19]/15"
} as const;

export const quickPrompts = [
  "Gợi ý túi luxury đang sale",
  "Tài khoản demo đăng nhập là gì?",
  "Có những brand nào?",
  "Tóm tắt các khu vực chính của home page"
];
