/* eslint-disable no-console */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

describe("LoggerService", () => {
  beforeEach(() => {
    // Mockujemy console metody
    vi.spyOn(console, "log").mockImplementation(() => undefined);
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    vi.spyOn(console, "warn").mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  describe("w środowisku testowym", () => {
    beforeEach(() => {
      // Resetujemy moduł loggera przed każdym testem
      vi.resetModules();
      // Ustawiamy środowisko na testowe
      vi.stubEnv("NODE_ENV", "test");
    });

    it("nie powinien wywołać console.log dla logger.info", async () => {
      // Import świeży logger po zmianie środowiska
      const { logger } = await import("../logger.service");

      // Act
      logger.info("Test message");

      // Assert
      expect(console.log).not.toHaveBeenCalled();
    });

    it("nie powinien wywołać console.error dla logger.error", async () => {
      // Import świeży logger po zmianie środowiska
      const { logger } = await import("../logger.service");

      // Act
      logger.error("Test error");

      // Assert
      expect(console.error).not.toHaveBeenCalled();
    });

    it("nie powinien wywołać console.log dla logger.debug", async () => {
      // Import świeży logger po zmianie środowiska
      const { logger } = await import("../logger.service");

      // Act
      logger.debug("Test debug");

      // Assert
      expect(console.log).not.toHaveBeenCalled();
    });

    it("nie powinien wywołać console.warn dla logger.warn", async () => {
      // Import świeży logger po zmianie środowiska
      const { logger } = await import("../logger.service");

      // Act
      logger.warn("Test warning");

      // Assert
      expect(console.warn).not.toHaveBeenCalled();
    });
  });

  describe("w środowisku produkcyjnym", () => {
    beforeEach(() => {
      // Resetujemy moduł loggera przed każdym testem
      vi.resetModules();
      // Ustawiamy środowisko na produkcyjne
      vi.stubEnv("NODE_ENV", "production");
      // Czyścimy stan logów
      vi.clearAllMocks();
    });

    it("powinien wywołać console.log dla logger.info", async () => {
      // Import świeży logger po zmianie środowiska
      const { logger } = await import("../logger.service");

      // Act
      logger.info("Test message");

      // Assert
      expect(console.log).toHaveBeenCalledWith("[INFO] Test message");
    });

    it("powinien wywołać console.error dla logger.error", async () => {
      // Import świeży logger po zmianie środowiska
      const { logger } = await import("../logger.service");

      // Arrange
      const testError = new Error("Some error");

      // Act
      logger.error("Test error", testError);

      // Assert
      expect(console.error).toHaveBeenCalledWith("[ERROR] Test error", testError);
    });

    it("powinien wywołać console.log dla logger.debug", async () => {
      // Import świeży logger po zmianie środowiska
      const { logger } = await import("../logger.service");

      // Act
      logger.debug("Test debug");

      // Assert
      expect(console.log).toHaveBeenCalledWith("[DEBUG] Test debug");
    });

    it("powinien wywołać console.warn dla logger.warn", async () => {
      // Import świeży logger po zmianie środowiska
      const { logger } = await import("../logger.service");

      // Act
      logger.warn("Test warning");

      // Assert
      expect(console.warn).toHaveBeenCalledWith("[WARN] Test warning");
    });
  });
});
