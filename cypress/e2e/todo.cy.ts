describe("template spec", () => {
  it("passes", () => {
    cy.visit("https://example.cypress.io");
  });
});

describe("Backend", () => {
  it("checks get response", () => {
    const url = "http://localhost:3009";
    cy.request({
      method: "GET",
      url: `${url}/todo`,
    }).then((res) => {
      expect(res.body).to.be.a("array");
    });
  });
});

describe("Frontend", () => {
  it("connects", () => {
    const url = Cypress.env("FRONTEND_URL");
    cy.visit(url);
  });
  it("creates todo", () => {
    const url = Cypress.env("FRONTEND_URL");
    const text = new Date().getTime().toString();
    cy.visit(url);
    cy.get("[data-cy='input-text']").type(text);
    cy.get("[data-cy='submit']").click();
    cy.contains(text);
  });

  it("deletes todo", () => {
    const url = Cypress.env("FRONTEND_URL");

    const text = new Date().getTime().toString();
    cy.visit(url);
    cy.get("[data-cy='input-text']").type(text);
    cy.get("[data-cy='submit']").click();
    cy.get("[data-cy='todo-item-wrapper']")
      .contains(text)
      .parent()
      .within(() => {
        cy.get("[data-cy='todo-item-delete']").click();
      });
    cy.contains(text).should("not.exist");
  });

  it("updates todo", () => {
  const text = new Date().getTime().toString();
  const textUpdated = "123456";
  const url = Cypress.env("FRONTEND_URL");

  cy.visit(url);

  // สร้าง todo ใหม่
  cy.get("[data-cy='input-text']").type(text);
  cy.get("[data-cy='submit']").click();

  // กดปุ่มแก้ไขของ todo ที่สร้าง
  cy.get("[data-cy='todo-item-wrapper']")
    .contains(text)
    .parent()
    .within(() => {
      cy.get("[data-cy='todo-item-update']").click();
    });

  // รอให้ dialog เปิดและ input พร้อม
  cy.get("[data-cy='edit-input-text']")
    .should("be.visible")
    .should("not.be.disabled")
    .clear()
    .type(textUpdated);

  // กดปุ่ม Update
  cy.get("[data-cy='edit-submit']").click();

  // ตรวจสอบว่าข้อความถูกเปลี่ยนใน list
  cy.contains(textUpdated).should("exist");
  cy.contains(text).should("not.exist");
});
});
