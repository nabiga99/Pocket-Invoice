import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const generatePDF = async (element: HTMLElement, filename: string) => {
  try {
    // Make element temporarily visible for capture
    const originalDisplay = element.style.display;
    const originalPosition = element.style.position;
    const originalTop = element.style.top;
    const originalLeft = element.style.left;
    
    // Position off-screen but visible
    element.style.display = 'block';
    element.style.position = 'absolute';
    element.style.top = '-9999px';
    element.style.left = '-9999px';
    element.style.width = '800px'; // Set a fixed width
    
    // Wait for layout to settle
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const canvas = await html2canvas(element, {
      scale: 1.5,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      width: 800,
      height: element.scrollHeight || 1000
    });
    
    // Restore original styles
    element.style.display = originalDisplay;
    element.style.position = originalPosition;
    element.style.top = originalTop;
    element.style.left = originalLeft;
    element.style.width = '';
    
    // Validate canvas
    if (!canvas || canvas.width === 0 || canvas.height === 0) {
      throw new Error('Failed to capture element - canvas is empty');
    }
    
    const imgData = canvas.toDataURL('image/png');
    
    // Validate image data
    if (!imgData || imgData === 'data:,') {
      throw new Error('Failed to generate image data from canvas');
    }
    
    const pdf = new jsPDF();
    const imgWidth = 210;
    const pageHeight = 295;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
    
    console.log('PDF created, attempting download...', filename);
    
    // Use blob download method for better browser compatibility
    const pdfBlob = pdf.output('blob');
    console.log('PDF blob created:', pdfBlob.size, 'bytes');
    
    // Try multiple download methods for better compatibility
    if ((window.navigator as any).msSaveOrOpenBlob) {
      // For IE/Edge
      console.log('Using IE/Edge download method');
      (window.navigator as any).msSaveOrOpenBlob(pdfBlob, filename);
    } else {
      // Create object URL and download link
      const url = URL.createObjectURL(pdfBlob);
      
      // Try direct download first
      try {
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.style.display = 'none';
        
        // Ensure link is properly configured
        link.setAttribute('download', filename);
        link.setAttribute('href', url);
        
        // Add to DOM, click, and remove
        document.body.appendChild(link);
        console.log('Download link created, triggering click...');
        
        // Use setTimeout to ensure DOM is updated
        setTimeout(() => {
          link.click();
          console.log('Download triggered');
          
          // Clean up after click
          setTimeout(() => {
            if (document.body.contains(link)) {
              document.body.removeChild(link);
            }
            URL.revokeObjectURL(url);
            console.log('Cleanup completed');
          }, 1000);
        }, 100);
        
      } catch (directDownloadError) {
        console.error('Direct download failed, trying fallback:', directDownloadError);
        
        // Fallback: Open in new window
        try {
          const newWindow = window.open(url, '_blank');
          if (newWindow) {
            console.log('Opened PDF in new window as fallback');
            // Clean up URL after delay
            setTimeout(() => URL.revokeObjectURL(url), 5000);
          } else {
            throw new Error('Popup blocked');
          }
        } catch (fallbackError) {
          console.error('Fallback method failed:', fallbackError);
          
          // Final fallback: Show download URL
          const downloadMessage = `PDF generated successfully! If download doesn't start automatically, right-click this link and select "Save as": ${filename}`;
          if (confirm(downloadMessage + '\n\nWould you like to open the PDF in a new tab?')) {
            window.open(url, '_blank');
          }
          
          // Clean up URL after delay
          setTimeout(() => URL.revokeObjectURL(url), 10000);
        }
      }
    }
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};

export const shareOnWhatsApp = (text: string, url?: string) => {
  const message = encodeURIComponent(url ? `${text} ${url}` : text);
  const whatsappUrl = `https://wa.me/?text=${message}`;
  window.open(whatsappUrl, '_blank');
};

// Ghana regions
export const GHANA_REGIONS = [
  'Greater Accra',
  'Ashanti',
  'Eastern',
  'Western',
  'Central',
  'Volta',
  'Northern',
  'Upper East',
  'Upper West',
  'Brong-Ahafo',
  'Western North',
  'Ahafo',
  'Bono East',
  'Oti',
  'North East',
  'Savannah'
];

// Business categories
export const BUSINESS_CATEGORIES = [
  'Technology',
  'Healthcare',
  'Education',
  'Finance',
  'Retail',
  'Manufacturing',
  'Agriculture',
  'Construction',
  'Transportation',
  'Hospitality',
  'Entertainment',
  'Professional Services',
  'Non-Profit',
  'Government',
  'Other'
];

// Payment methods for receipts
export const PAYMENT_METHODS = [
  { value: 'cash', label: 'Cash' },
  { value: 'credit_card', label: 'Credit Card' },
  { value: 'mobile_money', label: 'Mobile Money (MoMo)' }
];

// Currency formatter for Ghana Cedis
export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-GH', {
    style: 'currency',
    currency: 'GHS',
    minimumFractionDigits: 2
  }).format(amount);
};
