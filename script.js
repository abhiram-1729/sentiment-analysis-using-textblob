document.addEventListener('DOMContentLoaded', () => {
    const reviewInput = document.getElementById('review-input');
    const analyzeBtn = document.getElementById('analyze-btn');
    const resultContainer = document.getElementById('result-container');
    const sentimentText = document.getElementById('sentiment-text');
    const confidenceText = document.getElementById('confidence-text');
    const confidenceBar = document.getElementById('confidence-bar');
    const sentimentIcon = document.getElementById('sentiment-icon');

    // API URL - Using relative path since backend now serves the frontend
    const API_URL = '/predict';

    const analyzeSentiment = async () => {
        const text = reviewInput.value.trim();
        if (!text) {
            alert('Please enter some text to analyze.');
            return;
        }

        // Disable button and show loading state
        analyzeBtn.disabled = true;
        analyzeBtn.innerHTML = '<i data-lucide="loader-2" class="animate-spin"></i> Analyzing...';
        lucide.createIcons();

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text }),
            });

            if (!response.ok) {
                throw new Error('API request failed');
            }

            const data = await response.json();
            displayResult(data);
        } catch (error) {
            console.error('Error:', error);
            alert(`Failed to connect to the backend at ${API_URL}. Please ensure the server is running.`);
        } finally {
            analyzeBtn.disabled = false;
            analyzeBtn.innerHTML = '<i data-lucide="sparkles"></i> Analyze Sentiment';
            lucide.createIcons();
        }
    };

    const displayResult = (data) => {
        const { sentiment, confidence } = data;
        const confPercent = Math.round(confidence * 100);

        // Update classes for theme
        resultContainer.className = `result-card glass ${sentiment}-theme`;
        resultContainer.classList.remove('hidden');

        // Update content
        sentimentText.textContent = sentiment;
        confidenceText.textContent = `Confidence: ${confPercent}%`;
        confidenceBar.style.width = `${confPercent}%`;

        // Update Icon
        sentimentIcon.innerHTML = sentiment === 'positive'
            ? '<i data-lucide="smile"></i>'
            : '<i data-lucide="frown"></i>';

        lucide.createIcons();

        // Smooth scroll to result
        resultContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    };

    analyzeBtn.addEventListener('click', analyzeSentiment);

    // Allow Enter key to trigger analysis (Shift+Enter for newline)
    reviewInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            analyzeSentiment();
        }
    });
});
