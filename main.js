document.addEventListener('DOMContentLoaded', () => {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('reveal-active');
                // Don'unobserve if we want repeated reveals, but for landing usually unobserve is better
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Dynamic Navigation Highlight
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-links a');

    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (window.pageYOffset >= (sectionTop - 200)) {
                current = section.getAttribute('id') || '';
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').includes(current) && current !== '') {
                link.classList.add('active');
            }
        });
    }, { passive: true });

    // Apply reveal class to sections and cards
    const revealElements = document.querySelectorAll('section, .glass-panel, h1, h2, .badge');
    revealElements.forEach(el => {
        el.classList.add('reveal');
        observer.observe(el);
    });

    // Button Micro-interactions
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            btn.style.setProperty('--x', `${x}px`);
            btn.style.setProperty('--y', `${y}px`);
        });
    });

    // Smooth Scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
    // Lead Modal Logic
    const modal = document.getElementById('lead-modal');
    const leadForm = document.getElementById('lead-form');
    const successMsg = document.getElementById('success-message');

    const openModal = (e) => {
        if (e) e.preventDefault();
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    };

    const closeModal = () => {
        modal.classList.remove('active');
        document.body.style.overflow = '';
        setTimeout(() => {
            leadForm.style.display = 'block';
            successMsg.style.display = 'none';
        }, 300);
    };

    // Link lead buttons to modal
    const leadButtons = document.querySelectorAll('.lead-button');
    leadButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            openModal(e);
            
            // Analytics Tracking
            if (typeof ym !== 'undefined') {
                ym(XXXXXXXX, 'reachGoal', 'LEAD_CLICK');
            }
            if (typeof VK !== 'undefined' && VK.Retargeting) {
                VK.Retargeting.Event('lead_complete');
            }
            
            // Google Analytics Goal
            if (typeof gtag !== 'undefined') {
                gtag('event', 'generate_lead', {
                    'event_category': 'engagement',
                    'event_label': 'Lead Button Click'
                });
            }
        });
    });

    document.querySelector('.modal-close').addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    // Form Submission
    leadForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(leadForm);
        const data = {
            name: formData.get('name'),
            contact: formData.get('contact'),
            url: window.location.href
        };

        const submitBtn = leadForm.querySelector('button');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Отправка...';

        try {
            await sendTelegramNotification(data);
            
            leadForm.style.display = 'none';
            successMsg.style.display = 'block';
            
            // Auto close after 3s
            setTimeout(closeModal, 3000);
        } catch (error) {
            console.error('Error sending lead:', error);
            alert('Ошибка при отправке. Пожалуйста, попробуйте еще раз.');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Отправить заявку';
        }
    });

    async function sendTelegramNotification(data) {
        const response = await fetch('/api/notify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (!response.ok) throw new Error('API error');
    }

    // Scroll Depth Tracking
    const scrollMarkers = [25, 50, 75, 100];
    const sentMarkers = new Set();

    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrollPercent = (scrollTop / scrollHeight) * 100;

        scrollMarkers.forEach(marker => {
            if (scrollPercent >= marker && !sentMarkers.has(marker)) {
                sentMarkers.add(marker);
                
                // Get current section ID
                let activeSection = '';
                sections.forEach(section => {
                    if (window.pageYOffset >= (section.offsetTop - 300)) {
                        activeSection = section.getAttribute('id') || 'unknown';
                    }
                });

                const eventName = `scroll_${marker}_percent`;
                
                if (typeof ym !== 'undefined') {
                    ym(XXXXXXXX, 'reachGoal', eventName, { section: activeSection });
                }
                
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'scroll_depth', {
                        'event_category': 'engagement',
                        'event_label': `Reached ${marker}% in ${activeSection}`,
                        'value': marker,
                        'section_id': activeSection
                    });
                }
                
                console.log(`Scroll depth: ${marker}% (Section: ${activeSection})`);
            }
        });
    }, { passive: true });
});
