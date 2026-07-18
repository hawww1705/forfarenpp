/* ==========================================================================
   FORM PROCESSOR - INQUIRY FORM VALIDATION & STORAGE MOCK
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initInquiryForm();
});

function initInquiryForm() {
  const form = document.getElementById('inquiryForm');
  if (!form) return;

  const responseContainer = document.createElement('div');
  responseContainer.className = 'form-response-message';
  responseContainer.style.marginTop = '1.5rem';
  responseContainer.style.padding = '1rem 1.5rem';
  responseContainer.style.fontFamily = "var(--font-heading)";
  responseContainer.style.fontSize = '0.95rem';
  responseContainer.style.textTransform = 'uppercase';
  responseContainer.style.letterSpacing = '0.05em';
  responseContainer.style.display = 'none';
  responseContainer.style.border = '1px solid transparent';
  responseContainer.style.transition = 'all 0.4s ease';

  form.appendChild(responseContainer);

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Reset status
    responseContainer.style.display = 'none';
    responseContainer.className = 'form-response-message';
    
    // Retrieve values
    const name = form.querySelector('#name').value.trim();
    const email = form.querySelector('#email').value.trim();
    const phone = form.querySelector('#phone').value.trim();
    const projectType = form.querySelector('#project-type').value;
    const budget = form.querySelector('#budget').value;
    const timeline = form.querySelector('#timeline').value;
    const message = form.querySelector('#message').value.trim();

    // Validation checks
    let errors = [];
    if (!name) errors.push('Name is required');
    
    if (!email) {
      errors.push('Email is required');
    } else if (!validateEmail(email)) {
      errors.push('Please enter a valid email address');
    }

    if (!phone) {
      errors.push('Phone / WhatsApp number is required');
    }

    if (!projectType) errors.push('Please select a project type');
    if (!message) errors.push('Please tell us a bit about your project');

    if (errors.length > 0) {
      // Display errors
      responseContainer.style.display = 'block';
      responseContainer.style.borderColor = 'rgba(217, 83, 79, 0.3)';
      responseContainer.style.backgroundColor = 'rgba(217, 83, 79, 0.05)';
      responseContainer.style.color = '#d9534f';
      responseContainer.innerHTML = errors.map(err => `• ${err}`).join('<br>');
      return;
    }

    // Prepare payload
    const submission = {
      name,
      email,
      phone,
      projectType,
      budget,
      timeline,
      message,
      timestamp: new Date().toISOString()
    };

    // Save submission locally for user review/mock testing
    const submissions = JSON.parse(localStorage.getItem('mada_inquiries') || '[]');
    submissions.push(submission);
    localStorage.setItem('mada_inquiries', JSON.stringify(submissions));

    // Show success visual response
    responseContainer.style.display = 'block';
    responseContainer.style.borderColor = 'rgba(92, 184, 92, 0.3)';
    responseContainer.style.backgroundColor = 'rgba(92, 184, 92, 0.05)';
    responseContainer.style.color = '#5cb85c';
    responseContainer.innerHTML = 'Thank you. Your inquiry has been logged. We will reach out within 24 hours.';

    // Clear form fields
    form.reset();

    // Trigger potential custom behavior (WhatsApp direct prefilled redirect option)
    // You could redirect user with pre-filled details to WhatsApp:
    /*
    const waText = `Hi MadaGlobal & IF Interior, I would like to inquire about a project.\nName: ${name}\nType: ${projectType}\nBudget: ${budget}\nMessage: ${message}`;
    const waUrl = `https://wa.me/628123456789?text=${encodeURIComponent(waText)}`;
    setTimeout(() => {
      window.open(waUrl, '_blank');
    }, 2000);
    */
  });
}

function validateEmail(email) {
  const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}
