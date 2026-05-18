declare global {
  namespace App {
    interface Locals {
      authorized?: boolean;
      userId?: string;
    }
  }
}

export {};
