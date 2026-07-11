import fs from "fs";
import path from "path";

describe("WhatsApp production session persistence", () => {
  it("mounts the Baileys authentication directory on a named volume", () => {
    const composePath = path.resolve(__dirname, "../../../../docker-compose.prod.yaml");
    const compose = fs.readFileSync(composePath, "utf8");

    expect(compose).toContain("- whatsapp-auth:/app/baileys_auth");
    expect(compose).toMatch(/^  whatsapp-auth:\s*$/m);
  });
});
