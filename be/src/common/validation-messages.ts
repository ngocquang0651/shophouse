import type { ValidationError } from "class-validator";

const fieldLabels: Record<string, string> = {
  name: "Tên sản phẩm",
  brand: "Thương hiệu",
  category: "Danh mục",
  price: "Giá bán",
  originalPrice: "Giá gốc",
  image: "Ảnh đại diện",
  images: "Ảnh sản phẩm",
  badge: "Nhãn",
  description: "Mô tả",
  stock: "Tồn kho",
  status: "Trạng thái",
  slug: "Đường dẫn",
  audience: "Đối tượng",
  productType: "Loại sản phẩm",
  tags: "Thẻ",
  variants: "Biến thể",
  material: "Chất liệu",
  details: "Chi tiết",
  careInstructions: "Hướng dẫn bảo quản",
  sizeGuideKey: "Bảng size",
  sku: "SKU",
  color: "Màu",
  colorHex: "Mã màu",
  size: "Size",
  sourceVariantId: "Mã biến thể nguồn",
  sourceLabel: "Tên biến thể nguồn",
  gtin: "Mã vạch",
  identifier: "Tài khoản",
  email: "Email",
  password: "Mật khẩu"
};

function extractNumber(message: string | undefined) {
  return message?.match(/-?\d+(?:\.\d+)?/g)?.pop();
}

function describeConstraint(key: string, message: string | undefined) {
  switch (key) {
    case "whitelistValidation":
      return "không được hỗ trợ";
    case "isNotEmpty":
      return "không được để trống";
    case "isString":
      return "phải là chuỗi ký tự";
    case "isNumber":
    case "isNumberString":
      return "phải là số";
    case "isInt":
      return "phải là số nguyên";
    case "isBoolean":
      return "phải là đúng hoặc sai";
    case "isArray":
      return "phải là một danh sách";
    case "isEnum":
    case "isIn":
      return "không hợp lệ";
    case "isUrl":
      return "phải là đường link hợp lệ (bắt đầu bằng http:// hoặc https://)";
    case "isEmail":
      return "không phải email hợp lệ";
    case "min":
      return `phải từ ${extractNumber(message) ?? "giá trị tối thiểu"} trở lên`;
    case "max":
      return `phải từ ${extractNumber(message) ?? "giá trị tối đa"} trở xuống`;
    case "minLength":
      return `phải có ít nhất ${extractNumber(message)} ký tự`;
    case "maxLength":
      return `không được quá ${extractNumber(message)} ký tự`;
    case "arrayMaxSize":
      return `không được quá ${extractNumber(message)} mục`;
    case "arrayMinSize":
      return `phải có ít nhất ${extractNumber(message)} mục`;
    case "matches":
      return "không đúng định dạng";
    default:
      return "không hợp lệ";
  }
}

function labelFor(path: string[]) {
  return path
    .map((segment) => {
      if (/^\d+$/.test(segment)) return `#${Number(segment) + 1}`;
      return fieldLabels[segment] ?? segment;
    })
    .join(" ");
}

function collect(errors: ValidationError[], path: string[], messages: string[]) {
  for (const error of errors) {
    const nextPath = [...path, error.property];

    for (const [key, message] of Object.entries(error.constraints ?? {})) {
      messages.push(`${labelFor(nextPath)} ${describeConstraint(key, message)}.`);
    }

    if (error.children?.length) {
      collect(error.children, nextPath, messages);
    }
  }
}

/** Turns class-validator errors into Vietnamese sentences a shop owner can act on. */
export function translateValidationErrors(errors: ValidationError[]): string[] {
  const messages: string[] = [];
  collect(errors, [], messages);
  return Array.from(new Set(messages));
}
