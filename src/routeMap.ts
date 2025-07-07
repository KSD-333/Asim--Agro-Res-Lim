export const routeMap = {
  // Admin
  adminDashboard: "jbdfjjfbjfhjub",
  adminUsers: "jfhjdbhjfb",
  adminOrders: "c3ju874kneuh",
  adminProducts: "d4nhjb849u",
  adminForms: "e5f6g7nkfkjh8",
  adminMessages: "f6g7h8ssffddi9",
  adminFeedback: "g7h8i9jdfdf0",
  adminProductsNew: "h8i9j0dsfk1",
  adminAnalytics: "i9j0k1l2dsfdfs",
  // Public & Protected
  home: "h1os2m3sdsesfd4",
  products: "p1dsfdfgbr2o3d4",
  productDetail: "p5d6fgdfsfdt7l8",
  about: "a9b8o7udfddfsd6",
  contact: "c1o2n3tdffbvf4",
  login: "l1o2g3idffdbvgf4",
  cart: "c5a6r7tvfdvdfv8",
  profile: "p9r8o7f6dfvfd",
  dealers: "d1e2a3ldfvdfvd4"
};

export const reverseRouteMap = Object.fromEntries(
  Object.entries(routeMap).map(([k, v]) => [v, k])
); 