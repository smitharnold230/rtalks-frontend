// Static version of main.js - loads content from JSON files instead of API calls

// Initialize the page with static content
document.addEventListener('DOMContentLoaded', () => {
    console.log('Loading static content...');
    
    // Load all static content
    loadStaticContent();
    
    // Setup form handlers
    setupTicketForm();
    setupModalHandlers();
});

// Load all static content from JSON files
async function loadStaticContent() {
    try {
        // Load speakers from JSON
        await loadSpeakers();
        
        // All other content is now hardcoded in HTML
        console.log('Static content loaded successfully');
    } catch (error) {
        console.error('Error loading static content:', error);
    }
}

// Load and display speakers from JSON file
async function loadSpeakers() {
    try {
        const response = await fetch('./data/speakers.json');
        if (response.ok) {
            const speakers = await response.json();
            displaySpeakers(speakers);
        } else {
            throw new Error('Failed to load speakers JSON');
        }
    } catch (error) {
        console.error('Error loading speakers:', error);
        // Show fallback message
        const speakersGrid = document.getElementById('speakersGrid');
        if (speakersGrid) {
            speakersGrid.innerHTML = '<p class="error-text">Speakers information will be available soon.</p>';
        }
    }
}

// Display speakers in auto-scrolling carousel
function displaySpeakers(speakers) {
    const track = document.getElementById('speakersTrack');
    if (!track) return;

    if (!speakers || !speakers.length) {
        track.innerHTML = '<p class="no-speakers">No speakers announced yet. Check back soon!</p>';
        return;
    }

    // Ensure consistent order
    speakers.sort((a, b) => a.id - b.id);

    const createSpeakerCard = (speaker) => `
        <article class="speaker-card">
            <img src="${speaker.image_url}" 
                 alt="${speaker.name}" 
                 class="speaker-image" 
                 loading="lazy">
            <h3 class="speaker-name">${speaker.name}</h3>
            ${speaker.title ? `<p class="speaker-title">${speaker.title}</p>` : ''}
        </article>
    `;

    // Duplicate the list to enable seamless infinite scroll (50% shift in CSS)
    const duplicated = [...speakers, ...speakers];
    track.innerHTML = duplicated.map(createSpeakerCard).join('');
}

// Setup ticket purchase form
function setupTicketForm() {
    const purchaseForm = document.getElementById('ticket-purchase-form');
    if (purchaseForm) {
        purchaseForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            if (!selectedTicketType) {
                showError('Please select a ticket package first.');
                return;
            }
            
            // Get package name based on type
            let packageName = 'Unknown Package';
            if (selectedTicketType === 'professional') packageName = 'Professional Pass';
            
            const formData = {
                name: purchaseForm.querySelector('#name').value,
                email: purchaseForm.querySelector('#email').value,
                phone: purchaseForm.querySelector('#phone').value,
                package: packageName,
                price: 200 // Static price for professional pass
            };
            
            // Validate form data
            if (!formData.name || !formData.email || !formData.phone) {
                showError('Please fill in all required fields.');
                return;
            }
            
            // For static version, just redirect to payment
            initiatePayment(formData);
        });
    }
}

// Show error message to user
function showError(message) {
    const errorDiv = document.getElementById('error-message') || createErrorDiv();
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    setTimeout(() => {
        errorDiv.style.display = 'none';
    }, 5000);
}

// Create error div if it doesn't exist
function createErrorDiv() {
    const div = document.createElement('div');
    div.id = 'error-message';
    div.style.cssText = 'display:none;background-color:#ff5555;color:white;padding:10px;border-radius:4px;margin:10px 0;';
    document.querySelector('main').insertBefore(div, document.querySelector('main').firstChild);
    return div;
}

// Modal handlers for ticket purchase
function setupModalHandlers() {
    // Contact Modal
    const contactModal = document.getElementById('contactModal');
    const contactCloseBtn = contactModal ? contactModal.querySelector('.close-btn') : null;
    const contactLink = document.querySelector('.nav-link[href="#contact"]');

    if (contactLink) {
        contactLink.addEventListener('click', function(e) {
            e.preventDefault();
            if (contactModal) contactModal.classList.add('show');
        });
    }
    if (contactCloseBtn) {
        contactCloseBtn.addEventListener('click', closeContactModal);
    }
    window.addEventListener('click', function(event) {
        if (event.target === contactModal) {
            closeContactModal();
        }
    });

    // Existing ticket modal logic
    const modal = document.getElementById('ticketModal');
    const closeBtn = modal ? modal.querySelector('.close-btn') : null;
    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            closeModal();
        }
    });
}

function closeContactModal() {
    const contactModal = document.getElementById('contactModal');
    if (contactModal) {
        contactModal.classList.remove('show');
    }
}

// Global variables
let selectedTicketType = null;

function buyTicket(type) {
    selectedTicketType = type;
    // For static version, redirect directly to payment
    initiatePayment({
        package: 'Professional Pass',
        price: 200
    });
}

function closeModal() {
    const modal = document.getElementById('ticketModal');
    if (modal) {
        modal.style.display = 'none';
    }
    selectedTicketType = null;
}

// Initiate payment - redirect to Razorpay
function initiatePayment(orderData) {
    // For static version, redirect to Razorpay payment link
    window.open("https://rzp.io/rzp/xL6JEhH", "_blank");
}

// Scroll to tickets section
function scrollToTickets() {
    document.getElementById('events').scrollIntoView({ behavior: 'smooth' });
}

// Handle contact form submission
// Allow native form submission to Formspree (no JS interception)
document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.noValidate = false; // use browser validation
    }
});

// Video debugging and handling
document.addEventListener('DOMContentLoaded', function() {
    const video = document.getElementById('bgVideo');
    
    if (video) {
        console.log('Video element found');
        
        video.addEventListener('loadstart', function() {
            console.log('Video loading started');
        });
        
        video.addEventListener('canplay', function() {
            console.log('Video can start playing');
        });
        
        video.addEventListener('error', function(e) {
            console.error('Video error:', e);
            console.error('Video error details:', video.error);
        });
        
        video.addEventListener('loadeddata', function() {
            console.log('Video data loaded');
        });
        
        // Force video to play
        video.play().catch(function(error) {
            console.error('Error playing video:', error);
        });
    } else {
        console.error('Video element not found');
    }
    
    // Google Maps click to directions functionality
    const mapEmbed = document.querySelector('.map-embed');
    if (mapEmbed) {
        mapEmbed.addEventListener('click', function() {
            window.open('https://www.google.com/maps/dir/?api=1&destination=Rathinam+Grand+Hall,+Pollachi+Main+Rd,+Eachanari,+Coimbatore,+Tamil+Nadu+641021', '_blank');
        });
        
        // Add a cursor pointer to indicate clickability
        mapEmbed.style.cursor = 'pointer';
        
        // Add a subtle overlay hint
        const overlay = document.createElement('div');
        overlay.className = 'map-click-hint';
        overlay.innerHTML = '🗺️ Click to get directions';
        overlay.style.cssText = `
            position: absolute;
            top: 10px;
            right: 10px;
            background: rgba(0, 0, 0, 0.7);
            color: white;
            padding: 5px 10px;
            border-radius: 15px;
            font-size: 12px;
            pointer-events: none;
            z-index: 10;
            opacity: 0.8;
        `;
        mapEmbed.style.position = 'relative';
        mapEmbed.appendChild(overlay);
    }
});

// Check for payment status in URL parameters
document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get('payment');
    const orderId = urlParams.get('order');
    
    if (paymentStatus && orderId) {
        let message = '';
        let isSuccess = false;
        
        switch(paymentStatus) {
            case 'success':
                message = `🎉 Payment Successful! Your ticket has been booked. Order ID: ${orderId}`;
                isSuccess = true;
                break;
            case 'failed':
                message = `❌ Payment Failed. Please try again. Order ID: ${orderId}`;
                break;
            case 'error':
                message = `⚠️ Payment Error. Please contact support. Order ID: ${orderId}`;
                break;
        }
        
        if (message) {
            showPaymentStatusMessage(message, isSuccess);
            // Clean URL after showing message
            setTimeout(() => {
                window.history.replaceState({}, document.title, window.location.pathname);
            }, 5000);
        }
    }
});

function showPaymentStatusMessage(message, isSuccess) {
    const messageDiv = document.createElement('div');
    messageDiv.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: ${isSuccess ? '#4CAF50' : '#f44336'};
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 10000;
        font-size: 16px;
        max-width: 90%;
        text-align: center;
    `;
    messageDiv.textContent = message;
    document.body.appendChild(messageDiv);
    
    // Auto-remove after 8 seconds
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.parentNode.removeChild(messageDiv);
        }
    }, 8000);
}

