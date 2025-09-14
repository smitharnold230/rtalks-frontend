// Razorpay hosted payment page integration
// Production-optimized version with dynamic API configuration

// Use dynamic API URL from config
const API_URL = window.API_CONFIG ? window.API_CONFIG.getApiUrl() : 'http://localhost:3001/api';

// Initialize payment when order is created
async function initiatePayment(order) {
    try {
        // Check if using hosted payment page
        if (order.useHostedPage && order.paymentLink) {
            // Redirect to Razorpay hosted payment page
            window.location.href = order.paymentLink;
            return;
        }
        
        // Check if this is test mode
        if (order.testMode) {
            // Simulate payment in test mode
            setTimeout(() => {
                if (window.confirm('Test Mode: Simulate successful payment?')) {
                    showSuccessMessage('Test Mode: Payment simulation successful! Order ID: ' + order.orderId);
                }
            }, 1000);
            return;
        }
        
        // Fallback: Get Razorpay configuration from backend with timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        const configResponse = await fetch(`${API_URL}/config`, {
            signal: controller.signal
        });
        clearTimeout(timeoutId);
        
        if (!configResponse.ok) {
            throw new Error('Failed to load payment configuration');
        }
        
        const config = await configResponse.json();
        
        if (config.testMode || config.useHostedPage) {
            // Handle test mode or redirect to hosted page
            setTimeout(() => {
                if (window.confirm('Test Mode: Razorpay not configured. Simulate payment?')) {
                    showSuccessMessage('Test Mode: Payment simulation successful! Order ID: ' + order.orderId);
                }
            }, 1000);
            return;
        }
        
        // If we reach here, something went wrong
        throw new Error('Payment configuration error');
        
    } catch (error) {
        console.error('Payment initiation error:', error);
        
        if (error.name === 'AbortError') {
            showError('Payment setup timeout. Please check your internet connection.');
        } else {
            showError('Unable to initiate payment. Please try again or contact support.');
        }
    }
}

// Handle successful payment
async function handlePaymentSuccess(response, orderId) {
    try {
        const verifyResult = await fetch(`${API_URL}/verify-payment`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                orderId: orderId,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature
            })
        });

        const data = await verifyResult.json();
        
        if (!verifyResult.ok) {
            if (verifyResult.status === 503 && data.error === 'Database connection not available') {
                throw new Error('Database connection is currently unavailable. Please try again later.');
            }
            throw new Error(`Payment verification failed: ${data.error || verifyResult.statusText}`);
        }

        showSuccessMessage();
    } catch (error) {
        console.error('Error verifying payment:', error);
        showError('Payment verification failed. Please contact support with your payment ID: ' + response.razorpay_payment_id);
    }
}

// Show success message
function showSuccessMessage(customMessage = null) {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.style.cssText = 'background-color:#4CAF50;color:white;padding:20px;border-radius:8px;margin:20px 0;text-align:center;';
    
    if (customMessage) {
        successDiv.innerHTML = `<h3>Success!</h3><p>${customMessage}</p>`;
    } else {
        successDiv.innerHTML = `
            <h3>Payment Successful!</h3>
            <p>Your ticket has been booked successfully.</p>
            <p>A confirmation email will be sent to your registered email address.</p>
            <button onclick="closeModal()" style="margin-top:10px;padding:10px 20px;background:#2196F3;color:white;border:none;border-radius:4px;cursor:pointer;">Close</button>
        `;
    }

    const form = document.getElementById('ticket-purchase-form');
    if (form) {
        form.replaceWith(successDiv);
    }
}

// Show error message
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
