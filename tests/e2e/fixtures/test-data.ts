/**
 * Dane testowe używane w testach E2E
 * Przechowywanie danych w jednym miejscu ułatwia utrzymanie testów
 */

export const TestUsers = {
  validUser: {
    email: "test@example.com",
    password: "Test123!",
    name: "Test User",
  },
  adminUser: {
    email: "admin@example.com",
    password: "Admin123!",
    name: "Admin User",
  },
  invalidUser: {
    email: "invalid@example.com",
    password: "wrong",
    name: "Invalid User",
  },
};

export const TestCards = {
  basicFlashcard: {
    front: "Co to jest TypeScript?",
    back: "TypeScript to typowany nadzbiór JavaScript stworzony przez Microsoft.",
  },
  multipleChoiceCard: {
    question: "Które z poniższych to typy pierwotne w TypeScript?",
    options: ["string", "array", "number", "object"],
    correctAnswers: [0, 2],
  },
  codingCard: {
    question: "Napisz funkcję, która dodaje dwie liczby",
    solution: "function add(a: number, b: number): number {\n  return a + b;\n}",
  },
};

export const TestSets = {
  basicSet: {
    name: "Podstawy TypeScript",
    description: "Zestaw kart do nauki podstaw TypeScript",
    isPublic: true,
  },
  advancedSet: {
    name: "Zaawansowany TypeScript",
    description: "Zaawansowane koncepcje TypeScript",
    isPublic: false,
  },
};

export const TestRoutes = {
  home: "/",
  login: "/login",
  register: "/register",
  dashboard: "/dashboard",
  cards: "/cards",
  createCard: "/cards/create",
  profile: "/profile",
};
