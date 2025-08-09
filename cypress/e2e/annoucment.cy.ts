describe("Create New Announcement", () => {
  const baseUrl = Cypress.env("FRONTEND_URL"); // ตั้งใน config

  it("should create a new announcement", () => {
    cy.visit(`${baseUrl}/announcements`);

    // 1. รอโหลดหน้าให้เสร็จ
    cy.contains("Announcements");

    // 2. คลิกปุ่มสร้างประกาศ
    cy.contains("Create New Announcement").click();

    // 3. กรอกข้อมูลใน dialog
    cy.get('input#title').type("ประกาศทดสอบจาก Cypress");
    cy.get('textarea#content').type("นี่คือเนื้อหาทดสอบจาก Cypress");
    cy.get('input#tags').type("test,cypress");

    // 4. คลิกปุ่ม Create
    cy.contains("Create Announcement").click();

    // 5. รอและเช็คว่า toast success แสดง
    cy.contains("Announcement created successfully", { timeout: 10000 }).should("be.visible");

    // 6. เช็คว่า title ใหม่ปรากฏอยู่ในหน้า
    cy.contains("ประกาศทดสอบจาก Cypress", { timeout: 10000 }).should("be.visible");
  });
});
