// ============================================
// GESTION DES CARTES SÉRIES
// ============================================
const seriesCards = document.querySelectorAll('.series-card');

seriesCards.forEach(card => {
  card.addEventListener('click', function() {
    const seriesName = this.dataset.series;
    handleSeriesClick(seriesName);
  });
});

function handleSeriesClick(seriesName) {
  // Remplacez par vos vrais liens
  const links = {
    'clandestine': 'https://votre-lien-clandestine.com',
    'voleuses': 'https://votre-lien-voleuses.com',
    'pionnieres': 'https://votre-lien-pionnieres.com'
  };
  
  if (links[seriesName]) {
    window.open(links[seriesName], '_blank');
  }
}

// ============================================
// GESTION DU FORMULAIRE NEWSLETTER
// ============================================
const newsletterForm = document.getElementById('newsletter-form');

newsletterForm.addEventListener('submit', async function(e) {
  e.preventDefault();
  
  const email = this.querySelector('input[type="email"]').value;
  const submitBtn = this.querySelector('.btn-submit');
  const originalText = submitBtn.textContent;
  
  // Animation du bouton
  submitBtn.textContent = 'Envoi...';
  submitBtn.disabled = true;
  
  try {
    // Simulation d'envoi (remplacez par votre vraie API)
    await simulateAPICall(email);
    
    // Succès
    submitBtn.textContent = '✓ Inscrit !';
    submitBtn.style.background = '#27ae60';
    this.querySelector('input[type="email"]').value = '';
    
    setTimeout(() => {
      submitBtn.textContent = originalText;
      submitBtn.style.background = '';
      submitBtn.disabled = false;
    }, 3000);
    
  } catch (error) {
    // Erreur
    submitBtn.textContent = '✗ Erreur';
    submitBtn.style.background = '#e74c3c';
    
    setTimeout(() => {
      submitBtn.textContent = originalText;
      submitBtn.style.background = '';
      submitBtn.disabled = false;
    }, 3000);
  }
});

// Fonction de simulation (à remplacer par votre vraie API)
function simulateAPICall(email) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      console.log('Email soumis:', email);
      resolve();
    }, 1500);
  });
}

// ============================================
// ANIMATION AU SCROLL
// ============================================
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function(entries) {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, observerOptions);

// Préparer les éléments pour l'animation
document.querySelectorAll('.series-card, .about, .newsletter').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(30px)';
  el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
  observer.observe(el);
});

// ============================================
// SMOOTH SCROLL
// ============================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
});
