// Consolidated main.js for ticket purchase and event details
// Production-optimized version with dynamic API configuration

// Simple API URL configuration - always use production backend for testing
const API_URL = 'https://rtalks-back.onrender.com/api';

// Alternative: Use this for local backend development
// const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
//   ? 'http://localhost:5000/api'
//   : 'https://rtalks-back.onrender.com/api';

let selectedTicketType = null;

// Production error reporting with detailed debugging
function reportError(error, context = '') {
  if (window.console && console.error) {
    console.error(`[${context}]:`, error);
    
    // Add detailed debugging information
    if (error.message.includes('CORS') || error.message.includes('fetch')) {
      console.error('🚨 Possible CORS or connectivity issue detected!');
      console.error('🔗 Current API URL:', API_URL);
      console.error('🌍 Frontend URL:', window.location.origin);
      console.error('ℹ️ Check that the backend is running and CORS is configured for this domain');
    }
  }
  
  // In production, you might want to send this to an error reporting service
  // Example: Sentry.captureException(error, { extra: { context } });
}

// Helper function to get day suffix (1st, 2nd, 3rd, 4th, etc.)
function getDaySuffix(day) {
    if (day >= 11 && day <= 13) {
        return 'th';
    }
    switch (day % 10) {
        case 1: return 'st';
        case 2: return 'nd';
        case 3: return 'rd';
        default: return 'th';
    }
}

// Utility function for API calls with enhanced error handling and URL testing
async function fetchAPI(endpoint, options = {}) {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
        
        const fullUrl = `${API_URL}/${endpoint}`;
        console.log(`🔍 Attempting API call to: ${fullUrl}`);
        
        const response = await fetch(fullUrl, {
            signal: controller.signal,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });
        
        clearTimeout(timeoutId);
        
        const data = await response.json();
        if (!response.ok) {
            const errorMessage = data.message || data.error || response.statusText;
            if (response.status === 503 && data.code === 'DB_CONNECTION_ERROR') {
                throw new Error('Service temporarily unavailable. Please try again later.');
            }
            throw new Error(`API request failed: ${errorMessage}`);
        }
        console.log(`✅ API call successful: ${endpoint}`);
        return data;
    } catch (error) {
        if (error.name === 'AbortError') {
            throw new Error('Request timeout. Please check your internet connection.');
        }
        
        // Log detailed error for debugging
        console.error(`❌ API Error for ${endpoint}:`, {
            message: error.message,
            apiUrl: API_URL,
            fullUrl: `${API_URL}/${endpoint}`,
            error: error
        });
        
        reportError(error, `API call to ${endpoint}`);
        throw error;
    }
}

// Ticket prices
const ticketPrices = {
    'professional': 299,
    'executive': 2999,
    'leadership': 4999
};

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    // Log the API URL being used for debugging
    console.log(`🔗 Using API URL: ${API_URL}`);
    console.log(`🌍 Current domain: ${window.location.hostname}`);
    
    // Hide content initially to prevent flash of static content
    hideContentUntilLoaded();
    
    // Load all content from database first
    initializePageContent();
});

// Hide content initially to prevent flash
function hideContentUntilLoaded() {
    // Add loading class to body to control visibility
    document.body.classList.add('content-loading');
}

// Initialize all page content from database
async function initializePageContent() {
    try {
        // Load all content in parallel for faster loading
        await Promise.all([
            getEventDetails(),
            getStats(),
            loadHomepageContent(),
            loadSpeakers(),
            loadContactInfo()
        ]);
        
        // Setup form handlers after content is loaded
        setupTicketForm();
        setupModalHandlers();
        
        // Show content after everything is loaded
        document.body.classList.remove('content-loading');
        
    } catch (error) {
        console.error('Error initializing page content:', error);
        // Show content anyway but with error fallbacks
        document.body.classList.remove('content-loading');
        showContentLoadError();
    }
}

// Show error message when content fails to load
function showContentLoadError() {
    const heroTitle = document.querySelector('.hero-title');
    const heroDescription = document.querySelector('.hero-description');
    
    if (heroTitle) heroTitle.textContent = 'R-Talks Event Tickets';
    if (heroDescription) heroDescription.textContent = 'Unable to load event details. Please refresh the page or try again later.';
}

// Get stats from API
async function getStats() {
    try {
        const stats = await fetchAPI('stats');
        const statsLine = document.getElementById('statsLine');
        if (statsLine && stats) {
            statsLine.textContent = 
                `${stats.attendees || 0}+ Attendees | ${stats.partners || 0}+ Industrial Partners | ${stats.speakers || 0}+ Speakers`;
        }
    } catch (error) {
        console.error('Error fetching stats:', error);
        const statsLine = document.getElementById('statsLine');
        if (statsLine) {
            statsLine.textContent = 'Event statistics will be updated soon';
        }
    }
}

// Load homepage content from API
async function loadHomepageContent() {
    try {
        // Load packages from new API
        const packagesResponse = await fetch(`${API_URL}/packages`);
        let packages = [];
        
        if (packagesResponse.ok) {
            packages = await packagesResponse.json();
            
            if (packages && packages.length > 0) {
                updatePackageCards(packages);
                
                // Update ticket prices object for payment processing
                packages.forEach(pkg => {
                    ticketPrices[pkg.package_type] = pkg.price;
                });
            } else {
                showFallbackPackages();
            }
        } else {
            throw new Error('Failed to load packages');
        }
        
        // Load content sections
        const contentResponse = await fetch(`${API_URL}/content`);
        if (contentResponse.ok) {
            const contentData = await contentResponse.json();
            
            // Update hero section
            const heroData = contentData.find(c => c.section === 'hero');
            if (heroData) {
                const heroTitle = document.querySelector('.hero-title');
                const heroDescription = document.querySelector('.hero-description');
                
                if (heroTitle) heroTitle.textContent = heroData.title || 'R-Talks Event Tickets';
                if (heroDescription) heroDescription.textContent = heroData.description || 'Join us for the premier talent acquisition summit.';
            }
            
            // Update packages section
            const packagesData = contentData.find(c => c.section === 'event_info');
            if (packagesData) {
                const sectionTitle = document.querySelector('.section-title');
                const sectionDescription = document.querySelector('.section-description');
                
                if (sectionTitle) sectionTitle.textContent = packagesData.title || 'Event Packages';
                if (sectionDescription) sectionDescription.textContent = packagesData.description || 'Choose the package that suits you best.';
            }
        } else {
            throw new Error('Failed to load content');
        }
        
    } catch (error) {
        console.error('Error loading homepage content:', error);
        // Set fallback content
        showFallbackContent();
    }
}

// Show fallback content when API fails
function showFallbackContent() {
    const heroTitle = document.querySelector('.hero-title');
    const heroDescription = document.querySelector('.hero-description');
    const sectionTitle = document.querySelector('.section-title');
    const sectionDescription = document.querySelector('.section-description');
    
    if (heroTitle) heroTitle.textContent = 'R-Talks Event Tickets';
    if (heroDescription) heroDescription.textContent = 'Join us for the premier talent acquisition summit.';
    if (sectionTitle) sectionTitle.textContent = 'Event Packages';
    if (sectionDescription) sectionDescription.textContent = 'Choose the package that suits you best.';
    
    showFallbackPackages();
}

// Show fallback packages when database is unavailable
function showFallbackPackages() {
    const eventsGrid = document.querySelector('.events-grid');
    if (!eventsGrid) return;
    
    eventsGrid.innerHTML = `
        <div class="event-card">
            <p class="upcoming-label">Service Unavailable</p>
            <h3 class="event-name">Unable to Load Packages</h3>
            <p class="price">Please refresh the page</p>
            <div class="features" style="text-align: center; padding: 20px;">
                <p style="color: #666;">Event packages are temporarily unavailable.<br>Please try refreshing the page or contact support.</p>
            </div>
        </div>
    `;
}

// Update package cards with dynamic content
function updatePackageCards(packages) {
    const eventsGrid = document.querySelector('.events-grid');
    if (!eventsGrid) return;
    
    if (!packages || packages.length === 0) {
        showFallbackPackages();
        return;
    }
    
    // Create package cards dynamically
    eventsGrid.innerHTML = packages.map((pkg, index) => {
        const features = Array.isArray(pkg.features) ? pkg.features : JSON.parse(pkg.features || '[]');
        
        return `
            <div class="event-card">
                <p class="upcoming-label">${pkg.category || 'Package'}</p>
                <h3 class="event-name">${pkg.name || 'Event Package'}</h3>
                <p class="price">₹${(pkg.price || 0).toLocaleString()}</p>
                <ul class="features">
                    ${features.map(feature => `<li>${feature}</li>`).join('')}
                </ul>
                <button class="btn btn-primary" onclick="buyTicket('${pkg.package_type || 'general'}')">
                    Get Tickets
                </button>
            </div>
        `;
    }).join('');
}

// Load and display speakers
async function loadSpeakers() {
    try {
        const speakersResponse = await fetch(`${API_URL}/speakers`);
        
        if (speakersResponse.ok) {
            const speakers = await speakersResponse.json();
            displaySpeakers(speakers);
        } else {
            throw new Error('Failed to load speakers');
        }
    } catch (error) {
        console.error('Error loading speakers:', error);
        // Show fallback message
        const speakersCarousel = document.getElementById('speakersCarousel');
        if (speakersCarousel) {
            speakersCarousel.innerHTML = '<p class="error-text">Speakers information will be available soon.</p>';
        }
    }
}

// Display speakers in carousel
function displaySpeakers(speakers) {
    const carousel = document.getElementById('speakersCarousel');
    if (!carousel) return;
    if (!speakers || !speakers.length) {
        carousel.innerHTML = '<p>No speakers announced yet. Check back soon!</p>';
        return;
    }

    // Sort speakers by ID to maintain consistent order
    speakers.sort((a, b) => a.id - b.id);

    // Set the number of items for CSS animation
    carousel.style.setProperty('--items', speakers.length);
    const speakerArticles = speakers.map((speaker, index) => `
        <article style="--i: ${index};">
            <img src="${speaker.image_url || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDEyMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjAiIGhlaWdodD0iMTIwIiBmaWxsPSIjNkI0NkMxIi8+Cjx0ZXh0IHg9IjYwIiB5PSI2MCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPlNwZWFrZXI8L3RleHQ+Cjwvc3ZnPg=='}"
                alt="${speaker.name}"
                class="speaker-image"
                loading="lazy"
                onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDEyMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjAiIGhlaWdodD0iMTIwIiBmaWxsPSIjNkI0NkMxIi8+Cjx0ZXh0IHg9IjYwIiB5PSI2MCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPlNwZWFrZXI8L3RleHQ+Cjwvc3ZnPg=='">
            <h3 class="speaker-name">${speaker.name}</h3>
            ${speaker.title ? `<p class="speaker-title">${speaker.title}</p>` : ''}
            ${speaker.company ? `<p class="speaker-company">${speaker.company}</p>` : ''}
            ${speaker.bio ? `<p class="speaker-bio">${speaker.bio}</p>` : ''}
        </article>
    `).join('');

    // Update carousel content
    carousel.innerHTML = speakerArticles;
}

// Load and display contact information
async function loadContactInfo() {
    try {
        const contactResponse = await fetch(`${API_URL}/contact-info`);
        
        if (contactResponse.ok) {
            const contactInfo = await contactResponse.json();
            displayContactInfo(contactInfo);
        } else {
            throw new Error('Failed to load contact info');
        }
    } catch (error) {
        console.error('Error loading contact info:', error);
        // Show fallback contact info
        showFallbackContactInfo();
    }
}

// Show fallback contact info when API fails
function showFallbackContactInfo() {
    // Update phone numbers with fallback
    const phoneDetails = document.querySelector('.contact-card .phone-icon').closest('.contact-card').querySelector('.contact-details');
    if (phoneDetails) {
        phoneDetails.innerHTML = '<p>Contact information temporarily unavailable</p>';
    }
    
    // Update email with fallback
    const emailDetails = document.querySelector('.contact-card .email-icon').closest('.contact-card').querySelector('.contact-details');
    if (emailDetails) {
        emailDetails.innerHTML = '<p>Please try again later</p>';
    }
    
    // Update location with fallback
    const locationDetails = document.querySelector('.contact-card .location-icon').closest('.contact-card').querySelector('.contact-details');
    if (locationDetails) {
        locationDetails.innerHTML = '<p>Event location details will be updated soon</p>';
    }
}

// Display speakers in carousel
function displaySpeakers(speakers) {
    const carousel = document.getElementById('speakersCarousel');
    if (!carousel) return;
    if (!speakers || !speakers.length) {
        carousel.innerHTML = '<p>No speakers announced yet. Check back soon!</p>';
        return;
    }

    // Sort speakers by ID to maintain consistent order
    speakers.sort((a, b) => a.id - b.id);

    // Set the number of items for CSS animation
    carousel.style.setProperty('--items', speakers.length);

    // Calculate optimal duration based on number of speakers
    const durationPerSpeaker = 5; // 5 seconds per speaker
    const minDuration = 30; // minimum duration in seconds
    const calculatedDuration = Math.max(minDuration, speakers.length * durationPerSpeaker);
    carousel.style.setProperty('--carousel-duration', `${calculatedDuration}s`);

    // Create speaker articles
    const createSpeakerArticle = (speaker) => `
        <article>
            <img src="${speaker.image_url || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDEyMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjAiIGhlaWdodD0iMTIwIiBmaWxsPSIjNkI0NkMxIi8+Cjx0ZXh0IHg9IjYwIiB5PSI2MCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPlNwZWFrZXI8L3RleHQ+Cjwvc3ZnPg=='}"
                alt="${speaker.name}"
                class="speaker-image"
                loading="lazy"
                onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDEyMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjAiIGhlaWdodD0iMTIwIiBmaWxsPSIjNkI0NkMxIi8+Cjx0ZXh0IHg9IjYwIiB5PSI2MCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPlNwZWFrZXI8L3RleHQ+Cjwvc3ZnPg=='">
            <h3 class="speaker-name">${speaker.name}</h3>
            ${speaker.title ? `<p class="speaker-title">${speaker.title}</p>` : ''}
            ${speaker.company ? `<p class="speaker-company">${speaker.company}</p>` : ''}
            ${speaker.bio ? `<p class="speaker-bio">${speaker.bio}</p>` : ''}
        </article>
    `;

    // Create the carousel track with duplicate items for seamless scrolling
    const speakersHtml = speakers.map(createSpeakerArticle).join('');
    carousel.innerHTML = `<div class="carousel-track">${speakersHtml}${speakersHtml}</div>`;

    // Handle speaker updates
    window.addEventListener('speakerAdded', () => {
        loadSpeakers();
    });
}
    
    // Note: Carousel functionality is now fully CSS-driven. Previous JS-based carousel code has been removed.

// Display contact information on homepage
function displayContactInfo(contactInfo) {
    // Update phone numbers
    const phoneDetails = document.querySelector('.contact-card .phone-icon').closest('.contact-card').querySelector('.contact-details');
    if (phoneDetails && contactInfo.phone_numbers && contactInfo.phone_numbers.length > 0) {
        phoneDetails.innerHTML = contactInfo.phone_numbers.map(phone => `<p>${phone}</p>`).join('');
    }
    
    // Update email
    const emailDetails = document.querySelector('.contact-card .email-icon').closest('.contact-card').querySelector('.contact-details');
    if (emailDetails && contactInfo.email) {
        emailDetails.innerHTML = `<p>${contactInfo.email}</p>`;
    }
    
    // Update location
    const locationDetails = document.querySelector('.contact-card .location-icon').closest('.contact-card').querySelector('.contact-details');
    if (locationDetails && contactInfo.location) {
        const location = contactInfo.location;
        const locationHTML = [];
        if (location.venue) locationHTML.push(`<p>${location.venue}</p>`);
        if (location.area) locationHTML.push(`<p>${location.area}</p>`);
        if (location.building) locationHTML.push(`<p>${location.building}</p>`);
        if (location.address) locationHTML.push(`<p>${location.address}</p>`);
        if (location.city) locationHTML.push(`<p>${location.city}</p>`);
        
        if (locationHTML.length > 0) {
            locationDetails.innerHTML = locationHTML.join('');
        }
    }
}

// Get event details from API
async function getEventDetails() {
    try {
        const eventData = await fetchAPI('event');
        if (eventData) {
            // Update elements that exist on the homepage
            const titleEl = document.getElementById('eventTitle');
            const dateEl = document.getElementById('eventDate');
            
            if (titleEl) titleEl.textContent = eventData.title || 'R-Talks Summit';
            
            if (dateEl && eventData.date) {
                // Format date for homepage display (20th September format)
                const date = new Date(eventData.date);
                const day = date.getDate();
                const suffix = getDaySuffix(day);
                const month = date.toLocaleDateString('en-US', { month: 'long' });
                const formattedDate = `${day}${suffix} ${month}`;
                dateEl.textContent = formattedDate;
            } else if (dateEl) {
                dateEl.textContent = 'Date TBD';
            }
            
            // Update other elements if they exist (for other pages)
            const descEl = document.getElementById('event-description');
            const timeEl = document.getElementById('event-time');
            const locationEl = document.getElementById('event-location');
            const priceEl = document.getElementById('ticket-price');

            if (descEl) descEl.textContent = eventData.description || '';
            if (timeEl) timeEl.textContent = eventData.time || '';
            if (locationEl) locationEl.textContent = eventData.location || '';
            if (priceEl) priceEl.textContent = `₹${eventData.price || 0}`;
        } else {
            throw new Error('No event data received');
        }
    } catch (error) {
        console.error('Error fetching event details:', error);
        // Set fallback for homepage if API fails
        const titleEl = document.getElementById('eventTitle');
        const dateEl = document.getElementById('eventDate');
        
        if (titleEl) titleEl.textContent = 'R-Talks Summit';
        if (dateEl) dateEl.textContent = 'Coming Soon';
    }
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
            else if (selectedTicketType === 'executive') packageName = 'Executive Pass';
            else if (selectedTicketType === 'leadership') packageName = 'Leadership Pass';
            
            const formData = {
                name: purchaseForm.querySelector('#name').value,
                email: purchaseForm.querySelector('#email').value,
                phone: purchaseForm.querySelector('#phone').value,
                package: packageName, // Use full package name
                price: ticketPrices[selectedTicketType] || 0
            };
            
            // Validate form data
            if (!formData.name || !formData.email || !formData.phone) {
                showError('Please fill in all required fields.');
                return;
            }
            
            if (!formData.price || formData.price <= 0) {
                showError('Invalid package selected. Please try again.');
                return;
            }
            
            try {
                const order = await createOrder(formData);
                if (order) {
                    initiatePayment(order);
                }
            } catch (error) {
                console.error('Error creating order:', error);
                // Error already shown by createOrder function
            }
        });
    }
}

// Create order through API
async function createOrder(ticketData) {
    try {
        const response = await fetchAPI('orders', {
            method: 'POST',
            body: JSON.stringify(ticketData)
        });
        return response;
    } catch (error) {
        console.error('Order creation failed:', error);
        
        // Show user-friendly error message
        const errorMsg = error.message.includes('Database connection') 
            ? 'Service temporarily unavailable. Please try again in a moment.'
            : error.message.includes('Missing required fields')
            ? 'Please fill in all required fields.'
            : 'Unable to process your request. Please check your information and try again.';
            
        showError(errorMsg);
        throw new Error(errorMsg);
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
    const modal = document.getElementById('ticketModal');
    const closeBtn = modal ? modal.querySelector('.close-btn') : null;

    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }

    window.onclick = function(event) {
        if (event.target === modal) {
            closeModal();
        }
    };
}

function buyTicket(type) {
    selectedTicketType = type;
    const modal = document.getElementById('ticketModal');
    const modalTitle = modal ? modal.querySelector('h2') : null;
    
    // Get package name from the type
    let packageDisplayName = 'Ticket Package';
    if (type === 'professional') packageDisplayName = 'Professional Pass';
    else if (type === 'executive') packageDisplayName = 'Executive Pass';
    else if (type === 'leadership') packageDisplayName = 'Leadership Pass';
    
    if (modalTitle) {
        modalTitle.textContent = `Purchase ${packageDisplayName}`;
    }
    if (modal) {
        modal.style.display = 'block';
    }
}

function closeModal() {
    const modal = document.getElementById('ticketModal');
    if (modal) {
        modal.style.display = 'none';
    }
    selectedTicketType = null;
}
