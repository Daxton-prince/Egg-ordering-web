document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('orderForm');
    const eggsSelect = document.getElementById('eggs');
    const customQuantity = document.getElementById('customQuantity');
    const messageDiv = document.getElementById('message');

    // Show/hide custom quantity field
    eggsSelect.addEventListener('change', function() {
        if (this.value === 'custom') {
            customQuantity.style.display = 'block';
        } else {
            customQuantity.style.display = 'none';
        }
    });

    // Form submission
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const submitBtn = form.querySelector('.submit-btn');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Placing Order...';

        // Get form data
        const formData = {
            name: document.getElementById('name').value,
            phone: document.getElementById('phone').value,
            eggs: document.getElementById('eggs').value,
            customEggs: document.getElementById('customEggs').value,
            location: document.getElementById('location').value,
            timestamp: new Date().toLocaleString()
        };

        try {
            // Use relative path for Vercel deployment
            const response = await fetch('/api/order', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            if (result.success) {
                showMessage('Order placed successfully! We will contact you soon.', 'success');
                form.reset();
                customQuantity.style.display = 'none';
            } else {
                showMessage('Error placing order. Please try again.', 'error');
            }
        } catch (error) {
            showMessage('Network error. Please check your connection.', 'error');
            console.error('Error:', error);
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Place Order';
        }
    });

    function showMessage(text, type) {
        messageDiv.textContent = text;
        messageDiv.className = type;
        messageDiv.style.display = 'block';
        
        setTimeout(() => {
            messageDiv.style.display = 'none';
        }, 5000);
    }
});