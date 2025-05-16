// test for adding a promotion positive scenario
describe("Promotion Add Flow", () => {
  beforeEach(() => {
    cy.login();
    cy.viewport(1280, 720);
    cy.visit("http://localhost:5173/shopOwner/promotion/add-promotion/123");
    cy.get("[data-cy=promotion-title]", { timeout: 15000 })
      .should("be.visible");
  });

  it("Adds a new promotion successfully", () => {
    cy.intercept("POST", "http://localhost:3000/api/promotions")
    .as("addPromotion");
    
    cy.get("[data-cy=promotion-title]").type("Summer Sale 2023");
    cy.get("[data-cy=promotion-description]").type("20% discount");
    
    cy.get("[data-cy=promotion-image]").selectFile(
      "cypress/fixtures/promotion.jpg",
      { force: true }
    );
    
    cy.get(".Spinner", { timeout: 30000 }).should("not.exist"); 
    cy.contains("Uploading...", { timeout: 30000 }).should("not.exist");
    cy.get("[data-cy=submit-promotion]").click();
    
    cy.wait("@addPromotion");
    cy.contains("Promotion added successfully").should("be.visible");
  });
});

// test case is for the negative scenario where the title is empty
describe("Promotion Add Flow - Negative Test", () => {
  beforeEach(() => {
    cy.login();
    cy.viewport(1280, 720);
    cy.visit("http://localhost:5173/shopOwner/promotion/add-promotion/123");
    cy.get("[data-cy=promotion-title]", { timeout: 15000 })
    .should("be.visible");
  });

  it("Should show error when submitting with empty title", () => {
    cy.get("[data-cy=promotion-description]").type("20% discount");
    
    cy.get("[data-cy=promotion-image]").selectFile(
      "cypress/fixtures/promotion.jpg",
      { force: true }
    );
    
    cy.contains("Uploading...", { timeout: 30000 }).should("not.exist");
    cy.get("[data-cy=submit-promotion]").click();
    
    cy.contains("Title is required").should("be.visible");
    
    cy.get("[data-cy=promotion-title]").should("have.value", ""); 
  });
});

// test case is for the negative scenario where the image is empty
describe("Promotion Add Flow - Negative Test", () => {
  beforeEach(() => {
    cy.login();
    cy.viewport(1280, 720);
    cy.visit("http://localhost:5173/shopOwner/promotion/add-promotion/123");
    cy.get("[data-cy=promotion-title]", { timeout: 15000 })
    .should("be.visible");
  });

  it("Should show error when submitting without image", () => {
    cy.get("[data-cy=promotion-title]").type("Summer Sale 2023");
    cy.get("[data-cy=promotion-description]").type("20% discount");
    
    cy.get("[data-cy=submit-promotion]").click();
    cy.contains("Image is required").should("be.visible");

    cy.url().should("include", "/add-promotion/123"); 
    cy.get("[data-cy=promotion-title]")
    .should("have.value", "Summer Sale 2023"); 
  });
});