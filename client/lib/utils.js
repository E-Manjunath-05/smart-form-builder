// Format date to readable string
export const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

// Download QR code as PNG
export const downloadQRCode = (dataUrl, formTitle) => {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `${formTitle.replace(/[^a-z0-9]/gi, '_')}_QR.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

// Copy text to clipboard
export const copyToClipboard = async (text) => {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (error) {
        console.error('Failed to copy:', error);
        return false;
    }
};

// Validate email
export const isValidEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
};

// Generate unique ID
export const generateId = () => {
    return Math.random().toString(36).substring(2, 15);
};

// Truncate text
export const truncateText = (text, maxLength) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
};
