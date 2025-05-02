// Updated itemCRUD.cy.js
describe("Item CRUD Operations", () => {
  let createdItemId="68147331ec38933b4c2107cc";
  const testItem = {
    name: `Cypress Test Item ${Date.now()}`,
    quantity: "10",
    price: "2500",
    description: "Cypress automated test item",
  };

  before(() => {
    cy.login();
  });

  it("Should perform full CRUD operations", () => {
    // === 1. Add Item ===
    cy.visit("http://localhost:5173/shopOwner/dashboard/add-item");

    // Intercept critical requests
    cy.intercept("POST", "http://localhost:3000/inventory/add-item").as("addItem");
    cy.intercept("POST", "https://firebasestorage.googleapis.com/v0/b/quickyshop-e41a0.appspot.com/o**").as("firebaseUpload");

    // Fill and submit form
    cy.get("[data-cy=item-name]").type(testItem.name);
    cy.get("[data-cy=item-quantity]").type(testItem.quantity);
    cy.get("[data-cy=item-price]").type(testItem.price);
    cy.get("[data-cy=item-description]").type(testItem.description);
    
    // Upload image
    cy.get("input[type=file]").selectFile("cypress/fixtures/test-image.jpg");
    cy.contains("Uploading...").should("not.exist");
    
    // Submit and verify
    cy.get("[data-cy=submit-item]").click();
    cy.wait(["@firebaseUpload", "@addItem"]);
    
    // Store created item ID
    cy.get("@addItem").then((interception) => {
      createdItemId = interception.response.body._id;
    });

    // === 2. View Item ===
    // Intercept list refresh
    cy.intercept("GET", "http://localhost:3000/inventory/owner-items").as("getItems");
    cy.visit("http://localhost:5173/shopOwner/dashboard/view-items");
    cy.wait("@getItems"); // Wait for list to load

    // === 3. Update Item ===
    cy.visit(`http://localhost:5173/shopOwner/dashboard/update-item/${createdItemId}`);
    cy.intercept("PATCH", `http://localhost:3000/inventory/update-item/${createdItemId}`).as("updateItem");
    const updatedPrice = "3000";
    cy.get("[data-cy=item-price]").clear().type(updatedPrice);
    cy.get("[data-cy=submit-item]").click();
    cy.wait("@updateItem").its("response.statusCode").should("eq", 200);

    // === 4. Delete Item ===
    cy.intercept("GET", "http://localhost:3000/inventory/owner-items").as("getItemsAgain");
    cy.visit("http://localhost:5173/shopOwner/dashboard/view-items");
    cy.wait("@getItemsAgain");

    cy.get("[data-cy=item-card]")
      .contains(testItem.name)
      .parents("[data-cy=item-card]")
      .find("[data-cy=delete-item]")
      .click();

    cy.on("window:confirm", () => true);
    cy.intercept("DELETE", `http://localhost:3000/inventory/delete-item/${createdItemId}`).as("deleteItem");
    cy.wait("@deleteItem").its("response.statusCode").should("eq", 200);
    cy.get("[data-cy=item-card]").contains(testItem.name).should("not.exist");
  });

  after(() => {
    // Optional cleanup
  });
});