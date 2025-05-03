describe('Performance Tests', () => {
  before(() => {
    cy.login();
  });

  it('should measure page load performance', () => {
    cy.visit('http://localhost:5173/shopOwner/dashboard', {
      onBeforeLoad: (win) => {
        win.performance.mark('start-load');
      },
      onLoad: (win) => {
        win.performance.mark('end-load');
        win.performance.measure('page-load', 'start-load', 'end-load');
        const measure = win.performance.getEntriesByName('page-load')[0];
        expect(measure.duration).to.be.lessThan(3000);
      }
    });
  });

  it('should measure image loading performance', () => {
    cy.visit('http://localhost:5173/shopOwner/dashboard/view-items');
    
    cy.get('img').each(($img) => {
      const startTime = performance.now();
      cy.wrap($img).should('be.visible').then(() => {
        const loadTime = performance.now() - startTime;
        expect(loadTime).to.be.lessThan(2000);
      });
    });
  });

  it('should measure navigation performance', () => {
    const pages = [
      '/shopOwner/dashboard',
      '/shopOwner/dashboard/view-items',
      '/shopOwner/dashboard/add-item'
    ];

    pages.forEach((page) => {
      cy.visit(`http://localhost:5173${page}`, {
        onBeforeLoad: (win) => {
          win.performance.mark('nav-start');
        },
        onLoad: (win) => {
          win.performance.mark('nav-end');
          win.performance.measure('navigation', 'nav-start', 'nav-end');
          const measure = win.performance.getEntriesByName('navigation')[0];
          expect(measure.duration).to.be.lessThan(2000); // 2 seconds max
        }
      });
    });
  });

  it('should measure resource loading performance', () => {
    cy.visit('http://localhost:5173/shopOwner/dashboard', {
      onLoad: (win) => {
        const resources = win.performance.getEntriesByType('resource');
        resources.forEach((resource) => {
          expect(resource.duration).to.be.lessThan(3000);
        });
      }
    });
  });
});
