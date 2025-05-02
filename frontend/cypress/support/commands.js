// Login command
Cypress.Commands.add("login", () => {
  cy.request({
    method: "POST",
    url: "http://localhost:3000/user/login", // Your login endpoint
    body: {
      email: "chalana@gmail.com", // Test credentials
      password: "Chalana@123",
    },
  }).then((response) => {
    window.localStorage.setItem("user", JSON.stringify(response.body));
    Cypress.env("AUTH_TOKEN", response.body.token); // Set token globally
  });
});
