// Kingfisher QR Code Scanner & Generator
// Main JavaScript functionality

(function() {
    'use strict';

    // State management
    let currentPage = 'scanner';
    let scannerStream = null;
    let scannerInterval = null;
    let autoRedirect = false;
    let qrHistory = [];
    let useFrontCamera = false;

    // DOM Elements - Navigation
    const navScanner = document.getElementById('nav-scanner');
    const navGenerator = document.getElementById('nav-generator');
    const btnTheme = document.getElementById('btn-theme');
    const btnInstall = document.getElementById('btn-install');

    // DOM Elements - Pages
    const pageScanner = document.getElementById('page-scanner');
    const pageGenerator = document.getElementById('page-generator');

    // DOM Elements - Scanner
    const videoElement = document.getElementById('qr-scanner');
    const canvasElement = document.getElementById('qr-canvas');
    const btnStartScanner = document.getElementById('btn-start-scanner');
    const btnStopScanner = document.getElementById('btn-stop-scanner');
    const btnSwitchCamera = document.getElementById('btn-switch-camera');
    const toggleRedirect = document.getElementById('toggle-redirect');
    const resultContainer = document.getElementById('result-container');
    const resultData = document.getElementById('result-data');
    const btnCopyResult = document.getElementById('btn-copy-result');
    const btnClearResult = document.getElementById('btn-clear-result');
    const scannerResults = document.getElementById('scanner-results');

    // DOM Elements - Generator
    const qrInput = document.getElementById('qr-input');
    const qrSize = document.getElementById('qr-size');
    const sizeValue = document.getElementById('size-value');
    const qrErrorLevel = document.getElementById('qr-error-level');
    const btnGenerateQR = document.getElementById('btn-generate-qr');
    const btnDownloadQR = document.getElementById('btn-download-qr');
    const btnCopyQRUrl = document.getElementById('btn-copy-qr-url');
    const qrPreview = document.getElementById('qr-preview');
    const qrInfo = document.getElementById('qr-info');
    const qrHistoryContainer = document.getElementById('qr-history');
    const btnClearHistory = document.getElementById('btn-clear-history');

    // DOM Elements - Modals
    const btnGuidelines = document.getElementById('btn-guidelines');
    const btnPrivacy = document.getElementById('btn-privacy');
    const btnAbout = document.getElementById('btn-about');
    const modalGuidelines = document.getElementById('modal-guidelines');
    const modalPrivacy = document.getElementById('modal-privacy');
    const modalAbout = document.getElementById('modal-about');

    // Initialize
    function init() {
        setupEventListeners();
        loadHistory();
        checkPWAInstallation();
        showPage('scanner');
    }

    // Setup Event Listeners
    function setupEventListeners() {
        // Navigation
        navScanner.addEventListener('click', () => showPage('scanner'));
        navGenerator.addEventListener('click', () => showPage('generator'));
        btnTheme.addEventListener('click', toggleTheme);

        // Scanner
        btnStartScanner.addEventListener('click', startScanner);
        btnStopScanner.addEventListener('click', stopScanner);
        btnSwitchCamera.addEventListener('click', switchCamera);
        toggleRedirect.addEventListener('click', () => {
            toggleRedirect.classList.toggle('active');
            autoRedirect = !autoRedirect;
        });
        btnCopyResult.addEventListener('click', copyResult);
        btnClearResult.addEventListener('click', clearResult);

        // Generator
        qrSize.addEventListener('input', () => {
            sizeValue.textContent = qrSize.value;
        });
        btnGenerateQR.addEventListener('click', generateQRCode);
        btnDownloadQR.addEventListener('click', downloadQRCode);
        btnCopyQRUrl.addEventListener('click', copyQRData);
        btnClearHistory.addEventListener('click', clearHistory);

        // Modals
        btnGuidelines.addEventListener('click', () => showModal(modalGuidelines));
        btnPrivacy.addEventListener('click', () => showModal(modalPrivacy));
        btnAbout.addEventListener('click', () => showModal(modalAbout));

        // Close modals
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', closeAllModals);
        });

        // Close modals on outside click
        [modalGuidelines, modalPrivacy, modalAbout].forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    closeAllModals();
                }
            });
        });
    }

    // Page Navigation
    function showPage(page) {
        currentPage = page;
        
        // Update navigation buttons
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        if (page === 'scanner') {
            navScanner.classList.add('active');
            pageScanner.classList.remove('hidden');
            pageGenerator.classList.add('hidden');
        } else {
            navGenerator.classList.add('active');
            pageGenerator.classList.remove('hidden');
            pageScanner.classList.add('hidden');
            stopScanner(); // Stop scanner when switching pages
        }
    }

    // Theme Toggle
    function toggleTheme() {
        // Simple theme toggle - could be expanded
        btnTheme.textContent = btnTheme.textContent === '🌙' ? '☀️' : '🌙';
        showNotification('Theme toggled!');
    }

    // Scanner Functions
    async function startScanner() {
        try {
            const constraints = {
                video: {
                    facingMode: useFrontCamera ? 'user' : 'environment',
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                }
            };

            scannerStream = await navigator.mediaDevices.getUserMedia(constraints);
            videoElement.srcObject = scannerStream;
            videoElement.play();

            showNotification('Scanner started!');
            
            // Note: Actual QR code scanning would require jsQR library
            // For now, we'll just show that the camera is active
            
        } catch (error) {
            console.error('Error accessing camera:', error);
            alert('Could not access camera. Please ensure camera permissions are granted.');
        }
    }

    function stopScanner() {
        if (scannerStream) {
            scannerStream.getTracks().forEach(track => track.stop());
            scannerStream = null;
            videoElement.srcObject = null;
            
            if (scannerInterval) {
                clearInterval(scannerInterval);
                scannerInterval = null;
            }
            
            showNotification('Scanner stopped');
        }
    }

    function switchCamera() {
        useFrontCamera = !useFrontCamera;
        if (scannerStream) {
            stopScanner();
            setTimeout(startScanner, 100);
        }
        showNotification('Camera switched!');
    }

    function copyResult() {
        const text = resultData.textContent;
        navigator.clipboard.writeText(text).then(() => {
            showNotification('Result copied to clipboard!');
        });
    }

    function clearResult() {
        resultContainer.classList.add('hidden');
        scannerResults.innerHTML = '<p class="text-gray-400 text-center py-8">Scan a QR code to see results here</p>';
    }

    // Generator Functions
    function generateQRCode() {
        const text = qrInput.value.trim();
        
        if (!text) {
            alert('Please enter text or URL to generate QR code');
            return;
        }

        // Clear previous QR code
        qrPreview.innerHTML = '';

        // Create a simple visual representation (placeholder)
        // In production, this would use QRCode.js library
        const qrDiv = document.createElement('div');
        qrDiv.style.width = qrSize.value + 'px';
        qrDiv.style.height = qrSize.value + 'px';
        qrDiv.style.background = 'white';
        qrDiv.style.border = '2px solid #10b981';
        qrDiv.style.borderRadius = '8px';
        qrDiv.style.display = 'flex';
        qrDiv.style.alignItems = 'center';
        qrDiv.style.justifyContent = 'center';
        qrDiv.style.padding = '20px';
        qrDiv.style.textAlign = 'center';
        qrDiv.style.color = '#000';
        qrDiv.style.fontSize = '12px';
        qrDiv.style.wordBreak = 'break-all';
        qrDiv.innerHTML = `<div>QR Code<br/><small>${text.substring(0, 50)}${text.length > 50 ? '...' : ''}</small></div>`;
        
        qrPreview.appendChild(qrDiv);

        // Show info and buttons
        qrInfo.classList.remove('hidden');
        btnDownloadQR.classList.remove('hidden');
        btnCopyQRUrl.classList.remove('hidden');

        // Update info
        document.getElementById('info-size').textContent = qrSize.value + 'px';
        document.getElementById('info-error').textContent = qrErrorLevel.value;
        document.getElementById('info-length').textContent = text.length + ' characters';

        // Add to history
        addToHistory(text);

        showNotification('QR Code generated!');
    }

    function downloadQRCode() {
        // Placeholder for download functionality
        showNotification('Download functionality requires QRCode.js library');
    }

    function copyQRData() {
        const text = qrInput.value;
        navigator.clipboard.writeText(text).then(() => {
            showNotification('QR data copied to clipboard!');
        });
    }

    // History Management
    function addToHistory(text) {
        const historyItem = {
            text: text,
            timestamp: new Date().toISOString()
        };

        qrHistory.unshift(historyItem);
        
        // Keep only last 10 items
        if (qrHistory.length > 10) {
            qrHistory = qrHistory.slice(0, 10);
        }

        saveHistory();
        renderHistory();
    }

    function renderHistory() {
        if (qrHistory.length === 0) {
            qrHistoryContainer.innerHTML = '<p class="text-gray-400 text-center py-4">No history yet. Generate a QR code to see it here!</p>';
            btnClearHistory.classList.add('hidden');
            return;
        }

        btnClearHistory.classList.remove('hidden');
        qrHistoryContainer.innerHTML = '';

        qrHistory.forEach((item, index) => {
            const historyDiv = document.createElement('div');
            historyDiv.className = 'history-item';
            historyDiv.innerHTML = `
                <div class="flex justify-between items-center">
                    <div class="flex-1" style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                        ${item.text.substring(0, 50)}${item.text.length > 50 ? '...' : ''}
                    </div>
                    <span class="text-xs text-gray-500">${formatDate(item.timestamp)}</span>
                </div>
            `;
            historyDiv.addEventListener('click', () => {
                qrInput.value = item.text;
                generateQRCode();
            });
            qrHistoryContainer.appendChild(historyDiv);
        });
    }

    function clearHistory() {
        if (confirm('Are you sure you want to clear all history?')) {
            qrHistory = [];
            saveHistory();
            renderHistory();
            showNotification('History cleared!');
        }
    }

    function saveHistory() {
        try {
            localStorage.setItem('qr-history', JSON.stringify(qrHistory));
        } catch (e) {
            console.error('Could not save history:', e);
        }
    }

    function loadHistory() {
        try {
            const saved = localStorage.getItem('qr-history');
            if (saved) {
                qrHistory = JSON.parse(saved);
                renderHistory();
            }
        } catch (e) {
            console.error('Could not load history:', e);
        }
    }

    // Modal Functions
    function showModal(modal) {
        closeAllModals();
        modal.classList.remove('hidden');
    }

    function closeAllModals() {
        modalGuidelines.classList.add('hidden');
        modalPrivacy.classList.add('hidden');
        modalAbout.classList.add('hidden');
    }

    // Utility Functions
    function showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    function formatDate(isoString) {
        const date = new Date(isoString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        
        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours}h ago`;
        
        const diffDays = Math.floor(diffHours / 24);
        if (diffDays < 7) return `${diffDays}d ago`;
        
        return date.toLocaleDateString();
    }

    function checkPWAInstallation() {
        // Check if app can be installed
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            btnInstall.classList.remove('hidden');
            btnInstall.addEventListener('click', () => {
                e.prompt();
            });
        });
    }

    // Start the application
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
